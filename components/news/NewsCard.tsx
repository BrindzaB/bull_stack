  import { format } from "date-fns"                                               
  import type { FinnhubNewsItem } from "@/types/finnhub"                          
                                                                                  
  interface NewsCardProps {                                                       
      article: FinnhubNewsItem                                                    
  }                                                                             

  export default function NewsCard({ article }: NewsCardProps) {                  
      return (
          <a                                                                      
              href={article.url}                                                
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 py-3 group"
          >         
            {article.image && (                                               
                  <img
                      src={article.image}
                      alt={article.headline}
                      className="h-16 w-24 shrink-0 rounded-lg object-cover 
  ml-auto"                                                                        
                  />
              )}                                                                  
              <div className="min-w-0 flex-1">
                  <p className="section-label mb-1">                              
                      {article.source} · {format(new Date(article.datetime *    
  1000), "MMM d")}                                                                
                  </p>                                                          
                  <p className="text-sm font-semibold text-[#f8f5fd] line-clamp-2 group-hover:text-[#22d3ee] transition-colors">
                      {article.headline}
                  </p>
                  <p className="text-xs text-white/50 line-clamp-2 mt-0.5">
                      {article.summary}                                           
                  </p>                                                            
              </div>                                                                                                                                                                                    
          </a>                                                                  
      )
  }
