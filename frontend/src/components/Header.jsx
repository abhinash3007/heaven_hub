
// import React, { useEffect, useState } from 'react';
// import { FaSearch } from 'react-icons/fa';
// import { Link, useNavigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';

// const Header = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const { currentUser } = useSelector((state) => state.user);
//   const navigate = useNavigate();

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const urlParams = new URLSearchParams(window.location.search);
//     urlParams.set('searchTerm', searchTerm);
//     const searchQuery = urlParams.toString();
//     navigate(`/search?${searchQuery}`);
//   };

//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const searchTermFromUrl = urlParams.get('searchTerm');
//     if (searchTermFromUrl) {
//       setSearchTerm(searchTermFromUrl);
//     }
//   }, [window.location.search]);

//   return (
//     <>
//       <header className='fixed top-0 left-0 w-full bg-white z-50 shadow-lg'>
//         <div className='flex justify-between items-center max-w-6xl mx-auto p-4'>
//           <Link to='/'>
//             <h1 className='font-bold text-xl flex flex-wrap'>
//               <span className='text-blue-600'>Heaven</span>
//               <span className='text-gray-800'>Hub</span>
//             </h1>
//           </Link>

//           <form onSubmit={handleSubmit} className='bg-gray-100 p-2 rounded-lg flex items-center w-full max-w-md'>
//             <input
//               type='text'
//               placeholder='Search...'
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className='bg-transparent focus:outline-none w-full p-2 rounded-l-lg'
//             />
//             <button type="submit" className='bg-blue-600 text-white p-2 rounded-r-lg flex items-center justify-center'>
//               <FaSearch />
//             </button>
//           </form>

//           <nav className='flex gap-6'>
//             <Link to='/home' className='hidden sm:block text-gray-700 hover:text-blue-600'>Home</Link>
//             <Link to='/foundation' className='hidden sm:block text-gray-700 hover:text-blue-600'>The Foundation</Link>
//             <Link to='/about' className='hidden sm:block text-gray-700 hover:text-blue-600'>About</Link>
//             <Link to='/profile'>
//               {currentUser ? (
//                 <img className='rounded-full h-8 w-8 object-cover border-2 border-gray-300' src={currentUser.avatar} alt='profile' />
//               ) : (
//                 <span className='text-gray-700 hover:text-blue-600'>Sign In</span>
//               )}
//             </Link>
//           </nav>
//         </div>
//       </header>
//     </>
//   );
// };

// export default Header;

// import React, { useEffect, useState } from 'react';
// import { FaSearch } from 'react-icons/fa';
// import { Link, useNavigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';

// const Header = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const { currentUser } = useSelector((state) => state.user);
//   const navigate = useNavigate();

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const urlParams = new URLSearchParams(window.location.search);
//     urlParams.set('searchTerm', searchTerm);
//     const searchQuery = urlParams.toString();
//     navigate(`/search?${searchQuery}`);
//   };

//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const searchTermFromUrl = urlParams.get('searchTerm');
//     if (searchTermFromUrl) {
//       setSearchTerm(searchTermFromUrl);
//     }
//   }, [window.location.search]);

//   return (
//     <header className='fixed top-0 left-0 w-full bg-white z-50 shadow-lg'>
//       <div className='flex flex-wrap justify-between items-center max-w-6xl mx-auto p-4'>
//         <Link to='/'>
//           <h1 className='font-bold text-xl flex flex-wrap'>
//             <span className='text-blue-600'>Heaven</span>
//             <span className='text-gray-800'>Hub</span>
//           </h1>
//         </Link>

//         {/* Search Bar */}
//         <form onSubmit={handleSubmit} className='bg-gray-100 p-2 rounded-lg flex items-center w-full max-w-md mt-4 sm:mt-0'>
//           <input
//             type='text'
//             placeholder='Search...'
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className='bg-transparent focus:outline-none w-full p-2 rounded-l-lg'
//           />
//           <button
//             type="submit"
//             className='bg-blue-600 text-white p-2 rounded-r-lg flex items-center justify-center'
//           >
//             <FaSearch />
//           </button>
//         </form>

//         {/* Navigation Links */}
//         <nav className='flex flex-wrap items-center gap-4 mt-4 sm:mt-0'>
//           <Link to='/home' className='text-gray-700 hover:text-blue-600 text-sm sm:text-base'>Home</Link>
//           <Link to='/foundation' className='text-gray-700 hover:text-blue-600 text-sm sm:text-base'>The Foundation</Link>
//           <Link to='/about' className='text-gray-700 hover:text-blue-600 text-sm sm:text-base'>About</Link>
//           <Link to='/profile'>
//             {currentUser ? (
//               <img
//                 className='rounded-full h-8 w-8 object-cover border-2 border-gray-300'
//                 src={currentUser.avatar}
//                 alt='profile'
//               />
//             ) : (
//               <span className='text-gray-700 hover:text-blue-600 text-sm sm:text-base'>Sign In</span>
//             )}
//           </Link>
//         </nav>
//       </div>

//       {/* Responsive Menu */}
//       <div className='block sm:hidden mt-2'>
//         <div className='flex justify-center'>
//           <button className='bg-blue-600 text-white py-2 px-4 rounded'>Menu</button>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;
import React, { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('searchTerm', searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [window.location.search]);

  return (
    <header className='fixed top-0 left-0 w-full bg-white z-50 shadow-lg'>
      <div className='flex flex-wrap justify-between items-center max-w-6xl mx-auto p-4'>
        <Link to='/'>
          <h1 className='font-bold text-xl flex flex-wrap'>
            <span className='text-blue-600'>Heaven</span>
            <span className='text-gray-800'>Hub</span>
          </h1>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className='bg-gray-100 p-2 rounded-lg flex items-center w-full max-w-md mt-4 sm:mt-0'>
          <input
            type='text'
            placeholder='Search...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='bg-transparent focus:outline-none w-full p-2 rounded-l-lg'
          />
          <button
            type="submit"
            className='bg-blue-600 text-white p-2 rounded-r-lg flex items-center justify-center'
          >
            <FaSearch />
          </button>
        </form>

        {/* Navigation Links for Larger Screens */}
        <nav className='hidden sm:flex flex-wrap items-center gap-4 mt-4 sm:mt-0'>
          <Link to='/home' className='text-gray-700 hover:text-blue-600 text-sm sm:text-base'>Home</Link>
          <Link to='/foundation' className='text-gray-700 hover:text-blue-600 text-sm sm:text-base'>The Foundation</Link>
          <Link to='/about' className='text-gray-700 hover:text-blue-600 text-sm sm:text-base'>About</Link>
          <Link to='/profile'>
            {currentUser ? (
              <img
                className='rounded-full h-8 w-8 object-cover border-2 border-gray-300'
                src={currentUser.avatar}
                alt='profile'
              />
            ) : (
              <span className='text-gray-700 hover:text-blue-600 text-sm sm:text-base'>Sign In</span>
            )}
          </Link>
        </nav>

        {/* Responsive Menu Button for Small Screens */}
        <button
          className='sm:hidden bg-blue-600 text-white py-2 px-4 rounded'
          onClick={() => setMenuOpen(!menuOpen)}
        >
          Menu
        </button>
      </div>

      {/* Dropdown Menu for Small Screens */}
      {menuOpen && (
        <div className='sm:hidden bg-white shadow-lg'>
          <nav className='flex flex-col items-center gap-2 p-4'>
            <Link to='/home' className='text-gray-700 hover:text-blue-600 text-sm'>Home</Link>
            <Link to='/foundation' className='text-gray-700 hover:text-blue-600 text-sm'>The Foundation</Link>
            <Link to='/about' className='text-gray-700 hover:text-blue-600 text-sm'>About</Link>
            <Link to='/profile'>
              {currentUser ? (
                <img
                  className='rounded-full h-8 w-8 object-cover border-2 border-gray-300'
                  src={currentUser.avatar}
                  alt='profile'
                />
              ) : (
                <span className='text-gray-700 hover:text-blue-600 text-sm'>Sign In</span>
              )}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
