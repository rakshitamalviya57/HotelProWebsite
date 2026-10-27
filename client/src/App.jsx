import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { MDBContainer, MDBNavbar, MDBBtn, MDBCard, MDBCardBody, MDBCardImage, MDBCardTitle, MDBCardText, MDBRow, MDBCol,
  MDBInput, MDBTabs, MDBTabsItem, MDBTabsLink, MDBTabsContent, MDBTabsPane, MDBCarousel, MDBCarouselItem,
  MDBTable, MDBTableHead, MDBTableBody, MDBBadge } from 'mdb-react-ui-kit';
import { api, getUser } from './api';

const grad = { background: 'linear-gradient(90deg,#1e3c72,#2a5298,#6a11cb)' };
const fallback = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800';
const fmt = d => new Date(d).toLocaleDateString();

function Nav() {
  const user = getUser(), nav = useNavigate();
  const logout = () => { localStorage.removeItem('user'); localStorage.removeItem('token'); nav('/'); };
  return (
    <MDBNavbar className="px-3 py-2 d-flex justify-content-between" style={grad} dark>
      <Link to="/" className="text-white fw-bold fs-5">🏨 HotelPro</Link>
      <div className="d-flex align-items-center gap-2 text-white flex-wrap">
        {!user && <><Link className="text-white" to="/">Home</Link><Link className="text-white" to="/login">Login</Link><Link className="text-white" to="/signup">SignUp</Link></>}
        {user?.userType === 'Ordinary' && <><Link className="text-white" to="/user">Rooms</Link><Link className="text-white" to="/bookings">My Bookings</Link></>}
        {user && <><span>Hi, {user.name}</span><MDBBtn size="sm" color="light" onClick={logout}>Logout</MDBBtn></>}
      </div>
    </MDBNavbar>
  );
}

function RoomList({ canBook }) {
  const [rooms, setRooms] = useState([]), [dates, setDates] = useState({});
  useEffect(() => { api('/rooms').then(setRooms).catch(e => alert(e.message)); }, []);
  const setD = (id, k, v) => setDates(d => ({ ...d, [id]: { ...d[id], [k]: v } }));
  const book = async r => {
    const { from, to } = dates[r._id] || {};
    if (!from || !to) return alert('Select check-in and check-out dates');
    try { await api('/book', 'POST', { roomId: r._id, from, to }); alert('Room booked successfully'); } catch (e) { alert(e.message); }
  };
  if (!rooms.length) return <p className="text-center text-muted">No rooms available yet.</p>;
  return (
    <MDBRow>{rooms.map(r => (
      <MDBCol md="4" className="mb-4" key={r._id}>
        <MDBCard className="h-100">
          <MDBCardImage src={r.image || fallback} style={{ height: 200, objectFit: 'cover' }} />
          <MDBCardBody>
            <MDBCardTitle>{r.type} <small className="text-primary">₹{r.price}/night</small></MDBCardTitle>
            <MDBCardText>{r.description}</MDBCardText>
            {r.features?.map(f => <MDBBadge key={f} className="me-1" color="info">{f}</MDBBadge>)}
            {canBook === true && <div className="mt-3">
              <MDBInput type="date" label="Check-in" className="mb-2" onChange={e => setD(r._id, 'from', e.target.value)} />
              <MDBInput type="date" label="Check-out" className="mb-2" onChange={e => setD(r._id, 'to', e.target.value)} />
              <MDBBtn block onClick={() => book(r)}>Book Now</MDBBtn></div>}
            {canBook === 'login' && <Link to="/login"><MDBBtn block className="mt-3" outline>Login to book</MDBBtn></Link>}
          </MDBCardBody>
        </MDBCard>
      </MDBCol>))}
    </MDBRow>
  );
}

const slides = [['photo-1566073771259-6a8506099945', 'Luxury Suites'], ['photo-1582719478250-c89cae4dc85b', 'Comfort & Elegance'], ['photo-1551882547-ff40c63fe5fa', 'Your Home Away From Home']];
function Home() {
  return (<>
    <MDBCarousel showControls showIndicators>
      {slides.map(([id, t], i) => <MDBCarouselItem key={id} itemId={i + 1} src={`https://images.unsplash.com/${id}?w=1400`} alt={t} style={{ maxHeight: 420, objectFit: 'cover' }}>
        <h3 className="text-shadow">{t}</h3></MDBCarouselItem>)}
    </MDBCarousel>
    <MDBContainer className="py-5">
      <h2 className="text-center mb-3">About HotelPro</h2>
      <p className="text-center mb-5">HotelPro is a secure, scalable hotel management platform for reservations, guest management and room inventory — built for boutique hotels and large chains alike.</p>
      <h2 className="text-center mb-4">Our Rooms</h2><RoomList canBook="login" />
    </MDBContainer></>);
}

function Auth({ mode }) {
  const nav = useNavigate(), signup = mode === 'signup';
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '', phone: '', userType: '' });
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = async e => {
    e.preventDefault();
    try {
      if (signup) {
        if (Object.values(f).some(v => !v)) return alert('All fields are required');
        if (f.password.length < 6) return alert('Password must be at least 6 characters');
        if (f.password !== f.confirm) return alert('Passwords do not match');
        await api('/SignUp', 'POST', f); alert('Account created successfully'); nav('/login');
      } else {
        if (!f.email || !f.password) return alert('Email and password are required');
        const { token, user } = await api('/Login', 'POST', f);
        localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user));
        nav(user.userType === 'Admin' ? '/admin' : '/user');
      }
    } catch (err) { alert(err.message); }
  };
  return (
    <MDBContainer style={{ maxWidth: 440 }} className="py-5">
      <form onSubmit={submit}>
        <h3 className="mb-4 text-center">{signup ? 'Create Account' : 'Login'}</h3>
        {signup && <MDBInput className="mb-3" label="Name" onChange={set('name')} />}
        <MDBInput className="mb-3" type="email" label="Email" onChange={set('email')} />
        <MDBInput className="mb-3" type="password" label="Password" onChange={set('password')} />
        {signup && <>
          <MDBInput className="mb-3" type="password" label="Confirm Password" onChange={set('confirm')} />
          <MDBInput className="mb-3" label="Phone" onChange={set('phone')} />
          <select className="form-select mb-3" value={f.userType} onChange={set('userType')}>
            <option value="">Select user type</option><option>Ordinary</option><option>Admin</option></select></>}
        <MDBBtn block type="submit">{signup ? 'Sign Up' : 'Login'}</MDBBtn>
      </form>
    </MDBContainer>
  );
}

function UserHome() {
  const user = getUser();
  return (<>
    <div className="text-white text-center py-5" style={grad}>
      <h2>Hi, {user.name}</h2><p>Find your perfect room and book in seconds.</p>
      <Link to="/bookings"><MDBBtn color="light">View My Bookings</MDBBtn></Link>
    </div>
    <MDBContainer className="py-5"><RoomList canBook={true} /></MDBContainer></>);
}

function Bookings() {
  const [list, setList] = useState([]);
  const load = () => api('/mybookings').then(setList).catch(e => alert(e.message));
  useEffect(() => { load(); }, []);
  const cancel = async id => { if (!confirm('Cancel this booking?')) return; try { await api('/cancelbooking', 'POST', { bookingId: id }); load(); } catch (e) { alert(e.message); } };
  return (
    <MDBContainer className="py-4"><h3>My Bookings</h3>
      <div style={{ overflowX: 'auto' }}><MDBTable hover>
        <MDBTableHead><tr><th>Booking ID</th><th>Room</th><th>From</th><th>To</th><th>Total</th><th>Phone</th><th>Status</th><th></th></tr></MDBTableHead>
        <MDBTableBody>{list.map(b => <tr key={b._id}>
          <td>{b._id.slice(-8)}</td><td>{b.roomType}</td><td>{fmt(b.from)}</td><td>{fmt(b.to)}</td><td>₹{b.total}</td><td>{b.phone}</td>
          <td><MDBBadge color={b.status === 'Active' ? 'success' : 'danger'}>{b.status}</MDBBadge></td>
          <td>{b.status !== 'Cancelled' && <MDBBtn size="sm" color="danger" onClick={() => cancel(b._id)}>Cancel</MDBBtn>}</td></tr>)}</MDBTableBody>
      </MDBTable></div>{!list.length && <p className="text-muted">No bookings yet.</p>}
    </MDBContainer>
  );
}

function AddRoom({ onAdded }) {
  const empty = { type: '', price: '', image: '', description: '', features: '', count: 1 };
  const [f, setF] = useState(empty); const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = async e => {
    e.preventDefault();
    if (!f.type || !f.price) return alert('Type and price are required');
    try { await api('/rooms', 'POST', { ...f, price: +f.price, count: +f.count }); alert('Room added'); setF(empty); onAdded(); } catch (err) { alert(err.message); }
  };
  return (
    <form onSubmit={submit} style={{ maxWidth: 500 }}>
      {[['type', 'Room type'], ['price', 'Price per night'], ['count', 'Rooms of this type'], ['image', 'Image URL'], ['description', 'Description'], ['features', 'Features (comma separated)']].map(([k, l]) =>
        <MDBInput key={k} className="mb-3" label={l} value={f[k]} onChange={set(k)} />)}
      <MDBBtn type="submit">Add Room</MDBBtn>
    </form>
  );
}

function AdminHome() {
  const [tab, setTab] = useState('bookings'), [data, setData] = useState({ bookings: [], users: [] }), [rk, setRk] = useState(0);
  useEffect(() => {
    Promise.all([api('/allbookings'), api('/users')]).then(([bookings, users]) => setData({ bookings, users })).catch(e => alert(e.message));
  }, [rk, tab]);
  const T = ({ id, children }) => <MDBTabsItem><MDBTabsLink onClick={() => setTab(id)} active={tab === id}>{children}</MDBTabsLink></MDBTabsItem>;
  return (
    <MDBContainer className="py-4">
      <h3 className="mb-3">Admin Dashboard, {getUser().name}</h3>
      <MDBTabs className="mb-3"><T id="bookings">All Bookings</T><T id="rooms">All Rooms</T><T id="add">Add Room</T><T id="users">All Users</T></MDBTabs>
      <MDBTabsContent>
        <MDBTabsPane open={tab === 'bookings'}><div style={{ overflowX: 'auto' }}><MDBTable hover>
          <MDBTableHead><tr><th>ID</th><th>Guest</th><th>Room</th><th>From</th><th>To</th><th>Total</th><th>Status</th></tr></MDBTableHead>
          <MDBTableBody>{data.bookings.map(b => <tr key={b._id}><td>{b._id.slice(-8)}</td><td>{b.user?.name}</td><td>{b.roomType}</td>
            <td>{fmt(b.from)}</td><td>{fmt(b.to)}</td><td>₹{b.total}</td>
            <td><MDBBadge color={b.status === 'Active' ? 'success' : 'danger'}>{b.status}</MDBBadge></td></tr>)}</MDBTableBody></MDBTable></div></MDBTabsPane>
        <MDBTabsPane open={tab === 'rooms'}>{tab === 'rooms' && <RoomList key={rk} />}</MDBTabsPane>
        <MDBTabsPane open={tab === 'add'}><AddRoom onAdded={() => { setRk(rk + 1); setTab('rooms'); }} /></MDBTabsPane>
        <MDBTabsPane open={tab === 'users'}><MDBTable hover>
          <MDBTableHead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th></tr></MDBTableHead>
          <MDBTableBody>{data.users.map(u => <tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td>{u.phone}</td><td>{u.userType}</td></tr>)}</MDBTableBody></MDBTable></MDBTabsPane>
      </MDBTabsContent>
    </MDBContainer>
  );
}

const Guard = ({ role, children }) => {
  const u = getUser();
  return !u ? <Navigate to="/login" /> : u.userType !== role ? <Navigate to="/" /> : children;
};

export default function App() {
  return (
    <BrowserRouter><Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/signup" element={<Auth mode="signup" />} />
        <Route path="/user" element={<Guard role="Ordinary"><UserHome /></Guard>} />
        <Route path="/bookings" element={<Guard role="Ordinary"><Bookings /></Guard>} />
        <Route path="/admin" element={<Guard role="Admin"><AdminHome /></Guard>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
