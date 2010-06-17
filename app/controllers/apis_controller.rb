class ApisController < ApplicationController
  include GoogleSearch

  def search
    @results = map_search(:q => params[:q])
  end
end
