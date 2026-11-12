// MainMenu.jsx - the three top-level menus required by the project spec
import { Link } from 'react-router-dom';

export default function MainMenu() {
  return (
    <div className="menu-grid">
      <section className="menu-card book">
        <div className="menu-card-icon">📦</div>
        <h2>Book Inventory Main Menu</h2>
        <ul>
          <li><Link to="/books/register">📖 Register a New Book</Link></li>
          <li><Link to="/books/list">🗂️ List &amp; Update Books</Link></li>
        </ul>
      </section>

      <section className="menu-card author">
        <div className="menu-card-icon">✍️</div>
        <h2>Author Main Menu</h2>
        <ul>
          <li><Link to="/authors/register">👤 Register Author</Link></li>
          <li><Link to="/authors/assign">🔗 Assign Author ID to Book</Link></li>
        </ul>
      </section>

      <section className="menu-card client">
        <div className="menu-card-icon">🧑‍💼</div>
        <h2>Client Main Menu</h2>
        <ul>
          <li><Link to="/customers/register">🆕 Register New Customer</Link></li>
          <li><Link to="/customers/update">✏️ Update Customer Info</Link></li>
        </ul>
      </section>
    </div>
  );
}
