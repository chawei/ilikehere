class Place < ActiveRecord::Base
  acts_as_mappable :auto_geocode => { :field => :address, :error_message => 'could not be processed.' }
  
  has_many :placemarks
  has_many :users, :through => :placemarks
  
  validates_presence_of :address
  
  #before_save { name.gsub!(/<\/?[^>]*>/, "") }
  
  def average_rating
    placemarks_ratings = []
    placemarks.each { |p| placemarks_ratings << p.rating.to_f }
    return placemarks_ratings.average
  end
end
