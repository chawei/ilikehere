require 'json'
require "net/http"
require 'open-uri'

module GSearch
  HOST = "ajax.googleapis.com"
  PATH = "/ajax/services/search/local?v=1.0&q="
  USERAGENT = "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_5; ru-ru) AppleWebKit/525.27.1 (KHTML, like Gecko) Version/3.2.1 Safari/525.27.1"
  
  def get_most_possible_address(query, client_location = nil)
    results = get_results("#{query} #{client_location}")
    if results.blank?
      nil
    else
      result = Hashit.new results[0]
      return result.addressLines
    end
  end
  
  def get_results(raw_query)
    query = CGI.escape(raw_query)
    http = Net::HTTP.new(HOST)
    resp, data = http.get2(PATH+query, {'User-Agent' => USERAGENT})
    results = JSON.parse data
    return results["responseData"]["results"]
  end
  
  def get_results_by_url(url)
    open(url, "UserAgent" => USERAGENT).read =~ /<title>(.*?)<\/title>/
    title = $1
    return get_results($1)
  end
  
  def get_addresses(results)
    addresses = []
    results.each {|result| addresses << result["addressLines"]}
    return addresses
  end

end