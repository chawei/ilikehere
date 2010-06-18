set :stages, %w(dev staging production)
set :default_stage, 'dev'
require 'capistrano/ext/multistage'
