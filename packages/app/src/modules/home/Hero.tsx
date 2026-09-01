export const Hero = () => (
  <div
    style={{
      background: 'linear-gradient(120deg, #0D0D0D 0%, #1F3D0F 100%)',
      borderRadius: 4,
      padding: '32px 40px',
      color: '#F5F5F5',
    }}
  >
    <div
      style={{
        fontSize: 28,
        fontWeight: 700,
        color: '#A2E037',
        marginBottom: 8,
      }}
    >
      Ksquare IDP
    </div>
    <div style={{ fontSize: 16, maxWidth: 640, lineHeight: 1.5 }}>
      Self-service to create, catalog, and manage your services. Scaffold a
      new project, find who owns what, and check CI/CD status - all from one
      place.
    </div>
  </div>
);
