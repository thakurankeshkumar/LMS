# 🎓 LMS - Learning Management System

> **A complete, production-ready Learning Management System** built with Next.js 16, React 19, MongoDB, Tailwind CSS, and NextAuth.

![Status](https://img.shields.io/badge/Status-Production%20Ready-green) ![Version](https://img.shields.io/badge/Version-1.0.0-blue)

---

## ✨ Features

### For Students
✅ Dashboard with assigned tests | ✅ MCQ test-taking with timer | ✅ Fullscreen environment | ✅ Auto-submit on timeout | ✅ Results tracking | ✅ Test history | ✅ Mobile responsive

### For Teachers  
✅ Create MCQ tests | ✅ Add questions with explanations | ✅ Assign to students | ✅ Review submissions | ✅ Approve results | ✅ Analytics

### For Admins
✅ System analytics | ✅ User management | ✅ Role assignment | ✅ Public signup toggle | ✅ Submission monitoring

### Security
✅ Password hashing | ✅ JWT auth | ✅ Role-based access | ✅ Tab detection | ✅ Fullscreen requirement | ✅ Randomized questions

---

## 🚀 Quick Start (5 Minutes)

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000

# 3. Start dev server
npm run dev

# 4. Seed demo data
node scripts/seed.js

# 5. Login at http://localhost:3000
# Student: student@test.com / password123
# Teacher: teacher@test.com / password123
# Admin:   admin@test.com / password123
```

**[→ Detailed setup guide →](./QUICKSTART.md)**

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [QUICKSTART.md](./QUICKSTART.md) | Get running in 5 minutes |
| [SETUP.md](./SETUP.md) | Complete installation guide |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Vercel deployment checklist |
| [TESTING.md](./TESTING.md) | User journeys & test scenarios |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common issues & solutions |
| [FILE_REFERENCE.md](./FILE_REFERENCE.md) | Complete file inventory |

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS
- **Backend**: Node.js, Next.js API Routes
- **Database**: MongoDB Atlas + Mongoose
- **Auth**: NextAuth v4
- **Security**: bcryptjs, JWT

---

## 📁 Structure

```
LMS/
├── app/api/              # 15+ API endpoints
├── app/dashboards/       # 14 role-based pages
├── app/components/       # 8 reusable components
├── lib/models/           # 4 MongoDB schemas
├── scripts/seed.js       # Demo data
└── middleware.js         # Route protection
```

---

## 📊 Stats

- **60+ Files** | **8000+ Lines** | **15+ APIs** | **21 Pages** | **8 Components** | **4 Models**

---

## 🚀 Deploy to Vercel

```bash
git push origin main  # Push to GitHub
# Then on Vercel: Connect repo → Add env vars → Deploy
```

**[→ Full deployment guide →](./DEPLOYMENT.md)**

---

## 🧪 Testing

**Demo accounts ready to use:**
```
Admin:    admin@test.com / password123
Teacher:  teacher@test.com / password123
Student:  student@test.com / password123
```

**Sample test included** with 5 questions

**[→ Test scenarios guide →](./TESTING.md)**

---

## 🐛 Having Issues?

- **Setup problems**: Check [SETUP.md](./SETUP.md)
- **Common errors**: Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Deployment help**: Check [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Understanding files**: Check [FILE_REFERENCE.md](./FILE_REFERENCE.md)

---

## ✨ Key Highlights

1. **Production Quality** - Clean, scalable code
2. **Secure** - Multiple security layers
3. **Mobile First** - Fully responsive
4. **Dark Theme** - Modern UI
5. **Well Documented** - 7 guide documents
6. **Deployment Ready** - Vercel tested
7. **Demo Included** - Ready to test
8. **Fully Tested** - All flows verified

---

## 📄 License

MIT License - Free for educational and commercial use

---

## 🎯 Next Steps

1. **Setup**: Run `npm install` and follow [QUICKSTART.md](./QUICKSTART.md)
2. **Test**: Use demo accounts to explore all features
3. **Deploy**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel
4. **Customize**: Modify colors, add features, scale

---

**Ready? Let's go! 🚀**

```bash
npm install && npm run dev
```

---

**Version**: 1.0.0 | **Status**: ✅ Production Ready | **Built**: May 2026
