# template.rb 
#
# Author: David Hsu default rails stack
#
# -------------------------------------
 
# Delete unnecessary files  
run "rm README"  
run "rm doc/README_FOR_APP"  
run "rm public/index.html"  
run "rm public/favicon.ico"  
run "rm public/robots.txt"  
run 'rm -f public/javascripts/*' #add your fav js lib here  
  
# Set up git repository  
git :init  
   
# Copy database.yml for distribution use  
run "cp config/database.yml config/database.yml.example"  
   
# Set up .gitignore files  
run %{find . -type d -empty | xargs -I xxx touch xxx/.gitignore}  
file '.gitignore', <<-END  
.DS_Store  
coverage/*  
log/*.log  
lib/tasks/rspec.rake  
lib/tasks/cucumber.rake  
db/*.db  
db/*.sqlite3  
db/schema.rb  
db/sphinx  
tmp/**/*  
doc/api  
doc/app  
config/database.yml  
config/*.sphinx.conf  
coverage/*  
END  
  
git :add => '.', :commit => '-am Rails'  
   
# Install plugins as git submodules  
plugin 'acts_as_taggable_redux', :git => 'git://github.com/geemus/acts_as_taggable_redux.git', :submodule => true  
plugin 'hoptoad_notifier', :git => "git://github.com/thoughtbot/hoptoad_notifier.git", :submodule => true  
plugin 'asset_packager', :git => 'git://github.com/sbecker/asset_packager.git', :submodule => true  
plugin 'authlogic', :git => 'git://github.com/binarylogic/authlogic.git', :submodule => true  
plugin 'thinking-sphinx',     :git => 'git://github.com/freelancing-god/thinking-sphinx'  
  
## Initialize submodules  
git :submodule => "init"  
   
# Install gems  
gem 'mislav-will_paginate', :lib => 'will_paginate',  :source => 'http://gems.github.com'  
gem 'thoughtbot-factory_girl', :lib => 'factory_girl',  :source => 'http://gems.github.com'  
gem 'thoughtbot-paperclip', :lib => 'paperclip',  :source => 'http://gems.github.com'  
  
file '.testgems',  
%q{config.gem 'rspec'  
config.gem 'rspec-rails'  
config.gem 'webrat'  
config.gem 'cucumber'  
}  
run 'cat .testgems >> config/environments/test.rb && rm .testgems'  
  
rake 'gems:install', :sudo => true  
rake 'gems:install', :sudo => true, :env => 'test'  
  
# Tests  
generate 'rspec'  
generate 'cucumber'  
  
# Capify and create production environment.rb  
run 'capify .'  
run 'mkdir config/deploy'  
run 'touch config/deploy/production.rb'  
  
# Static controller  
file 'app/controllers/static_controller.rb',  
%q{class StaticController < ApplicationController  
end}   
run("mkdir app/views/static")   
file 'app/views/static/index.html',  
%q{  
<p>I am in <code>app/views/static/index.html.erb</code></p>  
}  
route "map.resource :static, :controller => 'static'"  
route "map.root :controller => 'static'"  
  
#Finally  
git :add => '.', :commit => "-am 'Plug-ins, Gems and basic Config'"  
puts "*" * 80  
puts "Go!"