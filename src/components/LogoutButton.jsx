import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LuLogOut } from "react-icons/lu";

export default function LogoutButton({className='', children}) {
    const {signOut} = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    async function handleLogout() {
        setLoading(true)
        await signOut()
        navigate('/login', {replace: true})
    }

    return(
        <button onClick={handleLogout} disabled={loading} style={{
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--cor-texto-secundario)',
              textDecoration: 'none',
              border: 'none',
              backgroundColor: 'transparent',
              marginTop: 'auto',
            }} >
            <LuLogOut size={24} />
        </button>
    )
}
