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
end
