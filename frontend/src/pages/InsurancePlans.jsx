import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function InsurancePlans() {
  const navigate = useNavigate()
  useEffect(() => { navigate('/dashboard') }, [navigate])
  return null
}
