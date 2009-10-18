class Placemark < ActiveRecord::Base
  cattr_reader :per_page
  @@per_page = 5
  
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
