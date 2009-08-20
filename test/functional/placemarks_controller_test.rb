require 'test_helper'

class PlacemarksControllerTest < ActionController::TestCase
  def test_index
    get :index
    assert_template 'index'
  end
  
  def test_new
    get :new
    assert_template 'new'
  end
  
  def test_create_invalid
    Placemark.any_instance.stubs(:valid?).returns(false)
    post :create
    assert_template 'new'
  end
  
  def test_create_valid
    Placemark.any_instance.stubs(:valid?).returns(true)
    post :create
    assert_redirected_to placemarks_url
  end
  
  def test_edit
    get :edit, :id => Placemark.first
    assert_template 'edit'
  end
  
  def test_update_invalid
    Placemark.any_instance.stubs(:valid?).returns(false)
    put :update, :id => Placemark.first
    assert_template 'edit'
  end
  
  def test_update_valid
    Placemark.any_instance.stubs(:valid?).returns(true)
    put :update, :id => Placemark.first
    assert_redirected_to placemarks_url
  end
end
