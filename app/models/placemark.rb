class Placemark < ActiveRecord::Base  
  belongs_to :user
  belongs_to :place
  
  def name
    place.name
  end
  
  def url
    place.url
  end
  
  def address
    place.address
  end
  
  def user_rating(dimension = :overall)
    rating = place.rates(dimension).find_by_user_id(user.id)
    rating.blank? ? "not rated yet" : "#{rating.stars}/10"
  end
end
