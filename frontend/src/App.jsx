import { Routes, Route, Link, useLocation } from 'react-router-dom';
import MainMenu from './pages/MainMenu.jsx';
import BookRegister from './pages/BookRegister.jsx';
import BookList from './pages/BookList.jsx';
import AuthorRegister from './pages/AuthorRegister.jsx';
import AssignAuthor from './pages/AssignAuthor.jsx';
import CustomerRegister from './pages/CustomerRegister.jsx';
import CustomerUpdate from './pages/CustomerUpdate.jsx';

function Breadcrumb() {
  const { pathname } = useLocation();
  if (pathname === '/') return null;
  return (
    <div className="breadcrumb">
      <Link to="/">← Back to Main Menu</Link>
    </div>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-icon">📚</span>
          <div>
            <h1>JL Book Order Application</h1>
            <p>Just Lee Books &mdash; Oracle 12c + React</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        <Breadcrumb />
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/books/register" element={<BookRegister />} />
          <Route path="/books/list" element={<BookList />} />
          <Route path="/authors/register" element={<AuthorRegister />} />
          <Route path="/authors/assign" element={<AssignAuthor />} />
          <Route path="/customers/register" element={<CustomerRegister />} />
          <Route path="/customers/update" element={<CustomerUpdate />} />
        </Routes>
      </main>

      <footer className="app-footer">
        JL Book Order Application &bull; Back end: Oracle 12c stored procedures &bull; Front end: React + Node.js/Express
      </footer>
    </div>
  );
}
