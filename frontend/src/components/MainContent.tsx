import React from "react";
import {  BarChart2, Shield, Users } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import logo from '../assets/SM_logo_531x107 2.png'

const features = [
  {
    icon: BarChart2,
    title: "Data Management",
    description: "Access and manage fund data with ease"
  },
  {
    icon: Users,
    title: "User Administration",
    description: "Manage user roles and permissions"
  },
  {
    icon: Shield,
    title: "Secure Operations",
    description: "Enterprise-grade security for all operations"
  }
];

const MainContent: React.FC = () => {
  return (
    <div className="flex flex-col font-poppins items-center justify-center min-h-[100%] p-6 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-5xl w-full mx-auto text-center">
        <div className="mb-12">
          <img 
            src={logo}
            alt="SF Logo" 
            className="w-32 md:w-40 mx-auto mb-8" 
          />
          <h1 className="text-3xl md:text-5xl font-bold text-[#003087] mb-4 tracking-tight">
            Welcome to Sundaram Mutual Fund
            <span className="text-[#003087]/80 block mt-2">Admin Portal</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Access powerful tools and insights to manage your operations efficiently and effectively
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="mb-4 rounded-full w-12 h-12 bg-[#003087]/5 flex items-center justify-center group-hover:bg-[#003087]/10 transition-colors">
                  <feature.icon className="w-6 h-6 text-[#003087]" />
                </div>
                <h3 className="text-lg font-semibold text-[#003087] mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        
      </div>
    </div>
  );
};

export default MainContent;

