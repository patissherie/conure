// Excludes visually ambiguous characters (0/O, 1/I) so codes are easier to
// read and re-type correctly. The join form itself still accepts any A-Z0-9
// character typed in, this just controls what we hand out.
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;

export function generateGroupCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}
