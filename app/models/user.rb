class User < ActiveRecord::Base
  validates :email, :session_token, presence: true, uniqueness: true
  validates :password_digest, presence: true
  validates :password, length: {minimum: 6, allow_nil: true}

  has_many :items
  has_many :views
  has_many :shares
  has_many :shared_items, through: :shares, source: :item

  before_validation do
    self.session_token ||= SecureRandom.urlsafe_base64(32)
  end

  after_create do
    views.create!
  end

  def self.find_by_credentials(email, password)
    user = find_by(email: email)

    user if user.try(:is_password?, password)
  end

  attr_reader :password

  def password=(secret)
    return unless secret
    self.password_digest = BCrypt::Password.create(secret)
    @password = secret
  end

  def is_password?(secret)
    BCrypt::Password.new(password_digest).is_password?(secret)
  end

  def reset_session_token!
    self.session_token = SecureRandom.urlsafe_base64(32)
    save!
    session_token
  end

  def nested_items
    @better_hash = Hash.new do |hash, key|
      hash[key] = {item: nil, parent: nil, children: []}
    end

    #TODO trim includes down?
    items.includes([:shares, :views]).order(:rank).each do |item|
      @better_hash[item.id][:item] = item
      @better_hash[item.id][:parent] = @better_hash[item.parent_id]
      @better_hash[item.parent_id][:children] << @better_hash[item.id]
    end

    @better_hash
  end
end
