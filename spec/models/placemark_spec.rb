require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe Placemark do
  before(:all) do
    user  = Factory.create(:user)
    place = Factory.create(:place, :name => "Good Restaurant", 
                                   :url => "http://goodrestaurant.com", 
                                   :address => "400 W 37st New York, NY")
    @placemark = Placemark.new(:user_id => user.id, 
                               :place_id => place.id)
  end
  
  it "should return place's url" do
    @placemark.url.should == "http://goodrestaurant.com"
  end
  
  it "should return place's name" do
    @placemark.name.should == "Good Restaurant"
  end
  
  it "should return place's address" do
    @placemark.address.should == "400 W 37st New York, NY"
  end
end