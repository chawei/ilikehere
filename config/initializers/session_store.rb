# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_ilikehere_session',
  :secret      => 'ebe9650a95154e3183cebce60caf1d01afc48a607061c8046cbeddf3a41819fb4eae1d061fed0f2b6981c983933705c4fe911180882509d0a8d4845008aaa3e4'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
