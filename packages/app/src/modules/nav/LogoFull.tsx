import { LogoIcon } from './LogoIcon';

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
      <LogoIcon />
      <span
        style={{
          fontFamily: 'Arial, sans-serif',
          fontWeight: 700,
          fontSize: 16,
          letterSpacing: 0.2,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ color: '#A2E037' }}>Ksquare</span>{' '}
        <span style={{ color: '#E8E8E8' }}>IDP</span>
      </span>
    </div>
  );
};
