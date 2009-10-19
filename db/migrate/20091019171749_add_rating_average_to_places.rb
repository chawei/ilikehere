class AddRatingAverageToPlaces < ActiveRecord::Migration
  def self.up
    remove_column :placemarks, :rating
    add_column :places, :rating_average, :decimal
  end

  def self.down
    add_column :placemarks, :rating, :integer
    remove_column :places, :rating_average
  end
end
