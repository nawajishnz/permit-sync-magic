import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

const navigation = [
  { name: 'Browse Countries', href: '/countries' },
  { name: 'Add-on Services', href: '/services' },
  { name: 'Testimonials', href: '/testimonials' },
  { name: 'Contact Us', href: '/contact' },
]

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex items-center justify-between">
      {/* Desktop navigation */}
      <div className="hidden lg:flex lg:gap-x-12">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600"
          >
            {item.name}
          </Link>
        ))}
      </div>
      <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
        <Button variant="outline" size="default">
          Sign in
        </Button>
        <Button variant="default" size="default">
          Get started
        </Button>
      </div>

      {/* Mobile menu button */}
      <div className="flex lg:hidden">
        <Button
          variant="ghost"
          size="default"
          onClick={() => setMobileMenuOpen(true)}
        >
          <span className="sr-only">Open main menu</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </Button>
      </div>

      {/* Mobile menu buttons */}
      <div className="py-6">
        <Button variant="outline" size="default" className="w-full mb-3">
          Sign in
        </Button>
        <Button variant="default" size="default" className="w-full">
          Get started
        </Button>
      </div>
    </div>
  )
}

export default Navbar 