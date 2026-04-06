// Firebase type declarations
declare module 'firebase/app' {
  export function initializeApp(config: any): any;
  export function getApps(): any[];
}

declare module 'firebase/auth' {
  export function getAuth(app?: any): any;
  export function signInWithEmailAndPassword(auth: any, email: string, password: string): Promise<any>;
  export function createUserWithEmailAndPassword(auth: any, email: string, password: string): Promise<any>;
  export function signInWithPopup(auth: any, provider: any): Promise<any>;
  export function signOut(auth: any): Promise<void>;
  export function onAuthStateChanged(auth: any, next: (user: any) => void, error?: (error: any) => void): () => void;
  export class GoogleAuthProvider {
    constructor();
    setCustomParameters(params: any): void;
    addScope(scope: string): void;
  }
}

declare module 'firebase/firestore' {
  export function getFirestore(app?: any): any;
  export function doc(db: any, path: string, ...segments: string[]): any;
  export function getDoc(docRef: any): Promise<any>;
  export function setDoc(docRef: any, data: any, options?: any): Promise<void>;
}

declare module 'firebase/storage' {
  export function getStorage(app?: any): any;
}

declare module 'firebase/analytics' {
  export function getAnalytics(app?: any): any;
}
