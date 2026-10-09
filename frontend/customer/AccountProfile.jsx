/**
 * @BACKEND_TEAM - ACCOUNT PROFILE INTEGRATION:
 * 
 * 1. User Data Fetching:
 *    - On mount, query `GET /api/user/profile` to populate first name, last name, email, mobile, address, etc.
 *    - Handle unauthorized responses by redirecting to `/login`.
 * 2. Edit Profile:
 *    - Clicking "Edit" should open a form. On submit, `PUT /api/user/profile` with updated fields.
 * 3. Sign Out:
 *    - Call `POST /api/auth/logout` to destroy session/clear httpOnly cookies.
 *    - Clear local client states (Zustand auth store, cart, etc.) and redirect to `/`.
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { axiosInstance } from '../shared/lib/axios';
import { Package, User, LogOut, Heart } from 'lucide-react';
import { COUNTRIES } from '../data/countries';

export default function AccountProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    mobile: '',
    gender: '',
    dob: '',
    country: '+91'
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get('/users/profile');
        const data = res.data;
        // Format date to YYYY-MM-DD for the input field
        const formattedDob = data.dob ? new Date(data.dob).toISOString().split('T')[0] : '';
        setProfile({
          fullName: data.fullName || '',
          email: data.email || '',
          mobile: data.mobile || '',
          gender: data.gender || '',
          dob: formattedDob,
          country: data.countryCode || '+91'
        });
      } catch (error) {
        console.error(error);
        if (error.response?.status === 401) {
          toast.error('Session expired. Please log in again.');
          navigate('/login');
        } else {
          toast.error('Failed to load profile');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axiosInstance.put('/users/profile', {
        fullName: profile.fullName,
        email: profile.email,
        mobile: profile.mobile,
        countryCode: profile.country,
        gender: profile.gender,
        dob: profile.dob
      });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-foreground border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <h1 className="font-heading text-4xl font-bold uppercase tracking-tight mb-12 border-b border-border pb-6">
        Welcome {profile.fullName ? profile.fullName.split(' ')[0] : ''}
      </h1>
      
      <div className="max-w-3xl mx-auto space-y-12">
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="font-heading text-2xl font-bold uppercase tracking-widest">Profile Details</h2>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="text-xs font-bold uppercase tracking-widest border-b border-black pb-0.5 hover:text-muted-foreground transition-colors">Edit Profile</button>
            ) : (
              <button onClick={handleSave} className="text-xs font-bold uppercase tracking-widest text-white bg-black px-4 py-2 hover:bg-black/80 transition-colors">Save Changes</button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Full Name</p>
              {isEditing ? (
                <input name="fullName" value={profile.fullName} onChange={handleChange} className="w-full font-bold border border-border p-3 focus:outline-none focus:border-foreground" />
              ) : (
                <p className="font-bold border border-border p-3 bg-muted/20">{profile.fullName}</p>
              )}
            </div>
            <div className="md:col-span-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Email</p>
              {isEditing ? (
                <input name="email" type="email" value={profile.email} onChange={handleChange} className="w-full font-bold border border-border p-3 focus:outline-none focus:border-foreground" />
              ) : (
                <p className="font-bold border border-border p-3 bg-muted/20">{profile.email}</p>
              )}
            </div>
            <div className="md:col-span-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Mobile Number</p>
              {isEditing ? (
                <input name="mobile" value={profile.mobile} onChange={handleChange} className="w-full font-bold border border-border p-3 focus:outline-none focus:border-foreground" />
              ) : (
                <p className="font-bold border border-border p-3 bg-muted/20">{profile.mobile}</p>
              )}
            </div>
            <div className="md:col-span-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Gender</p>
              {isEditing ? (
                <select name="gender" value={profile.gender} onChange={handleChange} className="w-full font-bold border border-border p-3 focus:outline-none focus:border-foreground">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              ) : (
                <p className="font-bold border border-border p-3 bg-muted/20">{profile.gender}</p>
              )}
            </div>
            <div className="md:col-span-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Date of Birth</p>
              {isEditing ? (
                <input name="dob" type="date" value={profile.dob} onChange={handleChange} className="w-full font-bold border border-border p-3 focus:outline-none focus:border-foreground uppercase text-xs tracking-widest" />
              ) : (
                <p className="font-bold border border-border p-3 bg-muted/20 uppercase text-xs tracking-widest">{profile.dob}</p>
              )}
            </div>
            
            <div className="md:col-span-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Country / Region</p>
              {isEditing ? (
                <select name="country" value={profile.country} onChange={handleChange} className="w-full font-bold border border-border p-3 focus:outline-none focus:border-foreground uppercase text-xs tracking-widest">
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-3 border border-border p-3 bg-muted/20">
                  <img src={COUNTRIES.find(c => c.code === profile.country)?.flag || COUNTRIES[0].flag} alt="Flag" className="w-5 h-auto shadow-sm" />
                  <span className="font-bold uppercase text-xs tracking-widest">{COUNTRIES.find(c => c.code === profile.country)?.name || COUNTRIES[0].name}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="pt-6 border-t border-border">
          <h2 className="font-heading text-2xl font-bold uppercase tracking-widest mb-6">Quick Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/wishlist" className="p-6 border border-border bg-white hover:border-black transition-all group">
              <Heart className="w-6 h-6 mb-3 text-black group-hover:scale-110 transition-transform" />
              <h3 className="font-bold uppercase text-sm tracking-wider">Wishlist</h3>
              <p className="text-xs text-muted-foreground mt-1">View saved items</p>
            </Link>
            <Link to="/track-orders" className="p-6 border border-border bg-white hover:border-black transition-all group">
              <Package className="w-6 h-6 mb-3 text-black group-hover:scale-110 transition-transform" />
              <h3 className="font-bold uppercase text-sm tracking-wider">Orders</h3>
              <p className="text-xs text-muted-foreground mt-1">Order tracking & history</p>
            </Link>
            <Link to="/addresses" className="p-6 border border-border bg-white hover:border-black transition-all group">
              <User className="w-6 h-6 mb-3 text-black group-hover:scale-110 transition-transform" />
              <h3 className="font-bold uppercase text-sm tracking-wider">Addresses</h3>
              <p className="text-xs text-muted-foreground mt-1">Manage delivery locations</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
