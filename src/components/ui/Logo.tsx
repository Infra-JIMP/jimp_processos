export function Logo({ size = 36 }: { size?: number }) {
  return (
    <img
      src="/favicon.ico"
      width={size}
      height={size}
      alt="Logo"
      style={{ display: 'block', flexShrink: 0 }}
    />
  );
}
