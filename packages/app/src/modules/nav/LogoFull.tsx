import ksquareLogo from '../../assets/ksquare-logo.png';

// The logo artwork is navy-on-transparent, so it needs a light background to
// stay legible on the (always dark) sidebar.
export const LogoFull = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 30,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          background: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <img
          src={ksquareLogo}
          alt="The Ksquare Group"
          style={{ width: 26, height: 26, objectFit: 'contain' }}
        />
      </div>
      <span
        style={{
          fontFamily: 'Arial, sans-serif',
          fontWeight: 700,
          fontSize: 16,
          letterSpacing: 0.2,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ color: '#6BA3E0' }}>Ksquare</span>{' '}
        <span style={{ color: '#E8E8E8' }}>IDP</span>
      </span>
    </div>
  );
};
