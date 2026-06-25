import { FaWhatsapp } from 'react-icons/fa'

function WhatsAppButton() {
  const NUMERO = '558796302464'

  return (
    <a href={`https://wa.me/${NUMERO}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-btn"
    >
      <FaWhatsapp size={28} color="white" />
    </a>
  )
}

export default WhatsAppButton