import type React from 'react'

interface DashboardCardProps {
  title: string
  description: string
  icon: React.ReactNode
  onClick?: () => void
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  icon,
  onClick
}) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-[24px] p-8 cursor-pointer hover:shadow-lg transition-all duration-300 relative group min-h-[250px] flex flex-col"
    >
      {/* Icon Section */}
      <div className="bg-[#FFF5F1] w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
        {icon}
      </div>

      {/* Content Section - using flex-grow to push button to bottom */}
      <div className="flex-grow">
        <div className="space-y-3 pr-12"> {/* Added right padding to prevent text overlap with button */}
          <h2 className="text-[24px] font-semibold text-[#1E293B] leading-tight">{title}</h2>
          <p className="text-[#64748B] text-[16px] leading-6">{description}</p>
        </div>
      </div>

      {/* Button Section - now properly aligned at bottom */}
      <div className="absolute bottom-8 right-8">
        <div className="w-10 h-10 rounded-full border-2 border-[#1E40AF] flex items-center justify-center text-[#1E40AF] overflow-hidden
                      group-hover:bg-[#1E40AF] group-hover:text-white group-hover:scale-110 
                      transition-all duration-300 ease-in-out">
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor"
            className="transform group-hover:translate-x-1 transition-transform duration-300 ease-in-out"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 12h14m-7-7l7 7-7 7" 
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
