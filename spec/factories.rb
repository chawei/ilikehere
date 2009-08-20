Factory.sequence(:username) { |n| "person#{n}" }
Factory.sequence(:email)    { |n| "person#{n}@example.com" }
Factory.sequence(:password) { |n| "password#{n}" }
   
Factory.define :user do |u|
  u.username { Factory.next :username }
  u.email    { Factory.next :email }
  u.password { Factory.next :password }
end

Factory.define :place do |p|
  p.name "place"
  p.url "http://place.com"
  p.address "place address"
end

Factory.define :placemark do |p|
  p.alias "placemark"
  p.rating 3
end