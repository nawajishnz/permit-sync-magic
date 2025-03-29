
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const TrustedPartners = () => {
  // Logo images would normally come from your assets folder
  const partners = [
    { id: 1, name: "Airway Airlines", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjAwIDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0zNyA0MkM0MS40MTgzIDQyIDQ1IDM4LjQxODMgNDUgMzRDNDUgMjkuNTgxNyA0MS40MTgzIDI2IDM3IDI2QzMyLjU4MTcgMjYgMjkgMjkuNTgxNyAyOSAzNEMyOSAzOC40MTgzIDMyLjU4MTcgNDIgMzcgNDJaIiBmaWxsPSIjNDI4QkNBIiAvPjxwYXRoIGQ9Ik0xNjIgMjVIMTQyQzEzOC4xMzQgMjUgMTM1IDI4LjEzNCAxMzUgMzJWNDRDMTM1IDQ3Ljg2NiAxMzguMTM0IDUxIDE0MiA1MUgxNjJDMTY1Ljg2NiA1MSAxNjkgNDcuODY2IDE2OSA0NFYzMkMxNjkgMjguMTM0IDE2NS44NjYgMjUgMTYyIDI1WiIgZmlsbD0iI0ZGOTkwMCIgLz48cmVjdCB4PSI3NSIgeT0iMjkiIHdpZHRoPSI0MCIgaGVpZ2h0PSIyMCIgcng9IjQiIGZpbGw9IiNGRjQ1MDAiIC8+PC9zdmc+" },
    { id: 2, name: "Global Traveler", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjAwIDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxjaXJjbGUgY3g9IjM3IiBjeT0iMzQiIHI9IjE0IiBmaWxsPSIjMzQ5OERCIiAvPjxwYXRoIGQ9Ik0xMDcgMThIODNDNzkuMTM0IDE4IDc2IDIxLjEzNCA3NiAyNVY1NUM3NiA1OC44NjYgNzkuMTM0IDYyIDgzIDYySDEwN0MxMTAuODY2IDYyIDExNCA1OC44NjYgMTE0IDU1VjI1QzExNCAyMS4xMzQgMTEwLjg2NiAxOCAxMDcgMThaIiBmaWxsPSIjRTc0QzNDIiAvPjxyZWN0IHg9IjEzMyIgeT0iMjgiIHdpZHRoPSI0MyIgaGVpZ2h0PSIyNCIgcng9IjYiIGZpbGw9IiMyN0FFNjAiIC8+PC9zdmc+" },
    { id: 3, name: "TravelGuard", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjAwIDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0zOSAyMS43NzE0TDUxIDI5LjIyODZMNTEgNDQuMTcxNEwzOSA1MS42Mjg2TDI3IDQ0LjE3MTRMMTI3IDI5LjIyODZMMzkgMjEuNzcxNFoiIGZpbGw9IiM5QzI3QjAiIC8+PHJlY3QgeD0iODUiIHk9IjI0IiB3aWR0aD0iNDciIGhlaWdodD0iMzIiIHJ4PSI4IiBmaWxsPSIjRjM5QzEyIiAvPjxjaXJjbGUgY3g9IjE2MCIgY3k9IjQwIiByPSIxNiIgZmlsbD0iIzE2QTJEQyIgLz48L3N2Zz4=" },
    { id: 4, name: "WorldVisa Services", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjAwIDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxjaXJjbGUgY3g9IjM2IiBjeT0iNDAiIHI9IjE2IiBmaWxsPSIjMUFCQzljIiAvPjxyZWN0IHg9IjcwIiB5PSIyNSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiByeD0iNCIgZmlsbD0iIzNENUFGRSIgLz48cGF0aCBkPSJNMTQ1IDUxSDEzNUMxMzEuNjg2IDUxIDEyOSA0OC4zMTQgMTI5IDQ1VjM1QzEyOSAzMS42ODYgMTMxLjY4NiAyOSAxMzUgMjlIMTQ1QzE0OC4zMTQgMjkgMTUxIDMxLjY4NiAxNTEgMzVWNDVDMTUxIDQ4LjMxNCAxNDguMzE0IDUxIDE0NSA1MVoiIGZpbGw9IiNGMUMwNUEiIC8+PC9zdmc+" },
    { id: 5, name: "ExpressDocs", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjAwIDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0zNyAyMUg1MVY1OUgzN1YyMVoiIGZpbGw9IiNFNzRDM0MiIC8+PHBhdGggZD0iTTg0IDI5Qzg5LjUyMjggMjkgOTQgMzMuNDc3MiA5NCAzOUM5NCA0NC41MjI4IDg5LjUyMjggNDkgODQgNDlDNzguNDc3MiA0OSA3NCA0NC41MjI4IDc0IDM5Qzc0IDMzLjQ3NzIgNzguNDc3MiAyOSA4NCAyOVoiIGZpbGw9IiMzNDk4REIiIC8+PHBhdGggZD0iTTEzNSAyOEMxNDIuMTggMjggMTQ4IDMzLjgyIDE0OCA0MUMxNDggNDguMTggMTQyLjE4IDU0IDEzNSA1NEMxMjcuODIgNTQgMTIyIDQ4LjE4IDEyMiA0MUMxMjIgMzMuODIgMTI3LjgyIDI4IDEzNSAyOFoiIGZpbGw9IiM5QzI3QjAiIC8+PHJlY3QgeD0iMTYwIiB5PSIzMCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzI1QUU4OCIgLz48L3N2Zz4=" },
    { id: 6, name: "Passport Pro", logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjAwIDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0zMCA0MEg1MFY1MEgzMFY0MFoiIGZpbGw9IiNGMzlDMTIiIC8+PHBhdGggZD0iTTMwIDMwSDUwVjQwSDMwVjMwWiIgZmlsbD0iI0U3NEMzQyIgLz48cmVjdCB4PSI3MCIgeT0iMjUiIHdpZHRoPSI1MCIgaGVpZ2h0PSIzMCIgcng9IjYiIGZpbGw9IiMzNDk4REIiIC8+PHBhdGggZD0iTTE0NSAyNUMxNTAuNTIzIDI1IDE1NSAyOS40NzcyIDE1NSAzNUMxNTUgNDAuNTIyOCAxNTAuNTIzIDQ1IDE0NSA0NUMxMzkuNDc3IDQ1IDEzNSA0MC41MjI4IDEzNSAzNUMxMzUgMjkuNDc3MiAxMzkuNDc3IDI1IDE0NSAyNVoiIGZpbGw9IiMyNUFFODgiIC8+PC9zdmc+" },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Trusted By Leading Travel Partners</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">We collaborate with the travel industry's best to provide seamless visa services</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-center">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.id}
              className="p-4 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <img 
                src={partner.logo} 
                alt={partner.name} 
                className="max-h-16 w-auto" 
                style={{ maxWidth: '100%' }}
              />
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="mt-16 bg-indigo-50 rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between shadow-sm border border-indigo-100"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="mb-6 md:mb-0 md:mr-10">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Are you a travel company?</h3>
            <p className="text-gray-600">Join our partner program and offer visa services to your customers</p>
          </div>
          <Button className="whitespace-nowrap bg-indigo-600 hover:bg-indigo-700">
            Partner With Us
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustedPartners;
