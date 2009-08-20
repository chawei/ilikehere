class CreatePlacemarks < ActiveRecord::Migration
  def self.up
    create_table :placemarks do |t|
      t.integer :user_id, :null => false
      t.integer :place_id, :null => false
      t.integer :rating
      t.string :alias
      t.timestamps
    end
  end
  
  def self.down
    drop_table :placemarks
  end
end
