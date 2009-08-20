require 'test_helper'

class PlacemarkTest < ActiveSupport::TestCase
  def test_should_be_valid
    assert Placemark.new.valid?
  end
end
