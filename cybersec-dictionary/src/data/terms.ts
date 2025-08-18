export type Term = {
  id: string
  term: string
  aka?: string[]
  simpleDefinition: string
  realWorldExample: string
  visualizationHint: string
  category: 'Network' | 'Web' | 'Malware' | 'Cryptography' | 'Risk' | 'Forensics' | 'Identity'
}

export const TERMS: Term[] = [
  {
    id: 'phishing',
    term: 'Phishing',
    aka: ['Email Scam'],
    simpleDefinition: 'Tricking you into giving up secrets (like passwords) by pretending to be someone you trust.',
    realWorldExample: 'An email looks like your bank asking you to “verify your account.” The link goes to a fake page that steals your login.',
    visualizationHint: 'Hook catching a password fish in a mailbox sea.',
    category: 'Risk',
  },
  {
    id: '2fa',
    term: 'Two-Factor Authentication (2FA)',
    simpleDefinition: 'A second lock on your account. Even if a thief knows your password, they still need a code from your phone.',
    realWorldExample: 'Logging into Instagram and entering a 6-digit code sent to your phone.',
    visualizationHint: 'Door with two locks: key (password) + phone code.',
    category: 'Identity',
  },
  {
    id: 'firewall',
    term: 'Firewall',
    simpleDefinition: 'A security gate that decides which network traffic is allowed or blocked.',
    realWorldExample: 'Your home router blocks unsolicited incoming connections from the internet.',
    visualizationHint: 'Brick wall filtering glowing packets.',
    category: 'Network',
  },
  {
    id: 'ransomware',
    term: 'Ransomware',
    simpleDefinition: 'Malware that locks your files and demands money to unlock them.',
    realWorldExample: 'A hospital’s systems get encrypted and attackers demand Bitcoin to restore patient records.',
    visualizationHint: 'Locked folder with timer and coin icon.',
    category: 'Malware',
  },
  {
    id: 'sql-injection',
    term: 'SQL Injection (SQLi)',
    simpleDefinition: 'Typing sneaky database commands into a website input to read or change data you should not access.',
    realWorldExample: "Putting `' OR 1=1 --` into a login field to bypass authentication.",
    visualizationHint: 'Syringe injecting code into a database cylinder.',
    category: 'Web',
  },
  {
    id: 'xss',
    term: 'Cross-Site Scripting (XSS)',
    simpleDefinition: 'Running malicious JavaScript in another user’s browser by abusing a website’s input.',
    realWorldExample: 'Posting a script in a comment that steals other users’ cookies when they view it.',
    visualizationHint: 'Speech bubble emitting code sparks into another screen.',
    category: 'Web',
  },
  {
    id: 'hashing',
    term: 'Hashing',
    simpleDefinition: 'Turning data into a fixed-length fingerprint. Good for checks, not for getting the original back.',
    realWorldExample: 'Websites store the hash of your password, not the password itself.',
    visualizationHint: 'Meat grinder turning long text into identical-size pellets.',
    category: 'Cryptography',
  },
  {
    id: 'encryption',
    term: 'Encryption',
    simpleDefinition: 'Scrambling data so only people with the key can read it.',
    realWorldExample: 'WhatsApp messages are encrypted end-to-end; only you and your friend can read them.',
    visualizationHint: 'Lock and key over scrambled letters.',
    category: 'Cryptography',
  },
]

