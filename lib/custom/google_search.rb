require 'json'
require 'uri'
require 'net/http'
require 'hpricot'
require 'hpricot_scrub'

# http://sophsec.com/research/exploring_ajax_search.html
# http://mapki.com/wiki/Google_Map_Parameters

module GoogleSearch
  HOST = 'maps.google.com'
  USERAGENT = 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.0.1) Gecko/20060111 Firefox/1.5.0.1'
  
  def GoogleSearch.map_search(options={})
    options[:hl] ||= "en"
    options[:g] ||= "US"
    options[:near] ||= "US"
    options[:z] ||= 12
    options[:v] ||= '1.0'
    options[:q] = CGI::escape(options[:q])
    
    results = []
    
    http = Net::HTTP.new(HOST)
    path = "/?" + options.map { |key,value|
      "#{key}=#{value}"
    }.join('&')
    puts path
    page = http.get2(path, {'User-Agent' => USERAGENT})
    doc = Hpricot.parse(page.body)
    
    # Results
    raw_results = (doc/"div.one")
    raw_results.each do |raw_result|
      result = {}
      
      # Title
      raw_title = (raw_result/"span#title")[0]
      if raw_title
        result["title"] = CGI::unescapeHTML(raw_title.andand.scrub.andand.innerHTML)
      end
      
      # Address
      raw_address = (raw_result/"span.adr")[0]
      if raw_address
        #raw_addresses.each do |raw_address|
        #  scrub_address = [ 
        #    (raw_address/"span").map { |span| span.innerHTML }
        #  ].join(adr_join_char)
        #end
        result["address"] = CGI::unescapeHTML(raw_address.andand.scrub.andand.innerHTML)
      end
      
      # Telephone
      raw_telephone = (raw_result/"span.tel")[0]
      if raw_telephone
        result["telephone"] = CGI::unescapeHTML(raw_telephone.andand.innerHTML)
      end
      
      results << result
    end
    
    return results
  end
  
  def GoogleSearch.search(options={})
    hash = JSON.parse(SophSec.get_search(options))

    if (hash.kind_of?(Hash) && hash['responseData']['results'])
      return hash['responseData']['results']
    end

    return []
  end
  
  # http://ajax.googleapis.com/ajax/services/search/local?v=1.0&q=www.cafelalo.com&sll=%22ca%22&z=8
  def GoogleSearch.get_search(options={})
    search_type ||= "local"
    #options[:context] ||= 0
    #options[:lstkp] ||= 0
    #options[:rsz] ||= 'small'
    #options[:hl] ||= 'en'
    #options[:gss] ||= '.com'
    #options[:start] ||= 0
    #options[:sig] ||= '582c1116317355adf613a6a843f19ece'
    #options[:key] ||= 'notsupplied'
    options[:v] ||= '1.0'
    options[:q] ||= '' or CGI::escape(options[:q])
    
    case search_type
      when "local"
        options[:g] ||= "US"
        options[:near] ||= "US"
        options[:z] ||= 12
    end
    
    http = Net::HTTP.new("ajax.googleapis.com")
    path = "/ajax/services/search/#{search_type.downcase()}?" + options.map { |key,value|
      "#{key}=#{value}"
    }.join('&')

    puts path
    resp, data = http.get2(path, {'User-Agent' => USERAGENT})
    return data
  end
end