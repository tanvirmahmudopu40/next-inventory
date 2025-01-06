import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Staff from '../../../../models/Staff';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        try {
          await connectDB();
          
          // Find user by email
          const user = await User.findOne({ email: credentials.email }).lean();

          if (!user) {
            throw new Error('No user found with this email');
          }

          const passwordMatch = await bcrypt.compare(credentials.password, user.password);

          if (!passwordMatch) {
            throw new Error('Incorrect password');
          }

          // If user is staff, get additional info
          if (user.role === 'STAFF') {
            const staffMember = await Staff.findOne({ userId: user._id }).lean();
            
            if (staffMember) {
              return {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
                staffId: staffMember._id.toString(),
                department: staffMember.department,
                designation: staffMember.designation
              };
            }
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.staffId = user.staffId;
        token.department = user.department;
        token.designation = user.designation;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.staffId = token.staffId;
        session.user.department = token.department;
        session.user.designation = token.designation;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: '/auth/signin'
  },
  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };