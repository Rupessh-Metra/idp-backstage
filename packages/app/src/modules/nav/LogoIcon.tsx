import ksquareLogo from '../../assets/ksquare-logo.png';

// The logo artwork is navy-on-transparent, so it needs a light background to
// stay legible on the (always dark) sidebar.
export const LogoIcon = () => {
  return (
    <div
      style={{
        width: 28,
        height: 28,
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
        style={{ width: 22, height: 22, objectFit: 'contain' }}
      />
    </div>
  );
};
