require 'test_helper'

class PlaceTest < ActiveSupport::TestCase
  def test_should_be_valid
    assert Place.new.valid?
  end
end
