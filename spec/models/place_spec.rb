require File.expand_path(File.dirname(__FILE__) + "/../spec_helper.rb")

describe Place do
  it "should return average rating" do
    user  = Factory.create(:user)
    place = Factory.create(:place)
    
    placemarks, ratings = [], []
    10.times do
      rating = rand(6).to_f
      Factory.create(:placemark, :rating => rating, :user_id => user.id, :place_id => place.id)
      ratings << rating
    end
    
    place.average_rating.should == ratings.average
  end
end