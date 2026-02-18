# 👨‍💼 Admin Guide - Knowledge Base Management

## 🔑 Accessing Admin Features

### Enable Admin Mode

By default, users are in "student" mode. To access admin features:

**Option 1: Browser Console**
```javascript
// Open browser console (F12)
localStorage.setItem('userRole', 'admin');
// Reload the page
location.reload();
```

**Option 2: Temporary (Session Only)**
```javascript
localStorage.setItem('userRole', 'admin');
```

### Disable Admin Mode
```javascript
localStorage.setItem('userRole', 'student');
location.reload();
```

---

## 📚 Knowledge Base Management

### Accessing Knowledge Base

1. Set your role to 'admin' (see above)
2. Click "📚 Knowledge Base" in the sidebar
3. You'll see the Knowledge Base Management interface

### Uploading Documents

#### Step 1: Select Category
Choose the appropriate category for your document:
- **Policies** - College policies, rules, regulations
- **Notices** - Official announcements, circulars
- **Holidays & Events** - Holiday lists, event schedules, important dates
- **Timetable & Schedule** - Class timetables, exam schedules, academic calendars
- **Fee Information** - Fee structure, payment details
- **Hostel Information** - Hostel rules, facilities
- **Academic Calendar** - Important dates, schedules
- **FAQ** - Frequently asked questions

#### Step 2: Select Files
- Click "Choose files or drag here"
- Select one or multiple files
- Supported formats:
  - PDF (.pdf)
  - Word Documents (.docx)
  - Text Files (.txt)
  - Markdown (.md)
- Maximum file size: 10MB per file
- Maximum files: 10 at once

#### Step 3: Upload & Process
- Click "Upload & Process" button
- Wait for processing (may take a few seconds)
- You'll see a success message when complete

---

## 📊 Knowledge Base Statistics

The stats panel shows:
- **Total Documents** - Number of documents in knowledge base
- **Document Chunks** - Number of text chunks for RAG
- **Last Updated** - When knowledge base was last modified

---

## 🔄 How It Works

### Document Processing Flow

1. **Upload** - Files are uploaded to server
2. **Storage** - Saved to `/knowledge/{category}/` folder
3. **Processing** - Text extracted from documents
4. **Chunking** - Text split into manageable chunks
5. **Embedding** - Chunks converted to vector embeddings
6. **Indexing** - Stored in vector database
7. **Ready** - AI can now retrieve information from documents

### RAG System

When a student asks a question:
1. Question converted to embedding
2. Similar chunks retrieved from vector store
3. Relevant chunks sent to AI as context
4. AI generates answer using retrieved information
5. Source badges show which documents were used

---

## 📝 Best Practices

### Document Naming
- Use descriptive names: `admission-policy-2024.pdf`
- Avoid special characters
- Use hyphens instead of spaces
- Include year/version if applicable

### Document Content
- Keep documents focused on one topic
- Use clear headings and structure
- Include dates and version numbers
- Avoid scanned images (use OCR first)

### Categories
- Choose the most specific category
- Policies: Long-term rules and regulations
- Notices: Time-sensitive announcements
- FAQ: Question-answer format

### File Formats
- **PDF**: Best for official documents
- **DOCX**: Good for editable documents
- **TXT**: Simple text, fastest processing
- **MD**: Markdown, good for structured text

---

## 🧪 Testing Uploads

After uploading a document:

1. **Switch to Chat View**
   - Click "💬 Chat Assistant" in sidebar

2. **Ask Related Question**
   - Example: If you uploaded a scholarship notice
   - Ask: "Tell me about scholarship deadlines"

3. **Check Source Badge**
   - AI response should show source badge
   - Example: "📄 Source: Official Notice"

4. **Expand Context**
   - Click "View Source Context"
   - Verify your document is listed

---

## 🔧 Troubleshooting

### Upload Fails

**Error: "No files uploaded"**
- Solution: Select files before clicking upload

**Error: "Invalid file type"**
- Solution: Only PDF, DOCX, TXT, MD allowed
- Convert other formats first

**Error: "File too large"**
- Solution: Files must be under 10MB
- Compress or split large files

### Document Not Retrieved

**AI doesn't use uploaded document:**
1. Check upload was successful
2. Wait a few seconds for processing
3. Ask specific questions related to document
4. Check document has clear, readable text

### Stats Not Updating

**Stats show 0 or old data:**
1. Refresh the page
2. Click Knowledge Base again
3. Check server is running
4. Check console for errors

---

## 🚀 Advanced Features

### Bulk Upload
- Select multiple files at once
- All files go to same category
- Processed in sequence

### Re-uploading
- Uploading same filename overwrites
- Use for updating documents
- Old version is replaced

### Manual Ingestion
If you add files directly to `/knowledge/` folders:
```bash
cd campusguide-ai/server
npm run ingest
```

---

## 📋 Admin Checklist

### Initial Setup
- [ ] Set role to admin
- [ ] Access Knowledge Base view
- [ ] Check stats are loading
- [ ] Test file selection

### Adding Documents
- [ ] Choose correct category
- [ ] Select appropriate files
- [ ] Upload and wait for success
- [ ] Verify stats updated

### Testing
- [ ] Switch to chat view
- [ ] Ask question about new document
- [ ] Check source badge appears
- [ ] Verify context shows document

---

## 🔐 Security Notes

### Production Deployment

In production, you should:

1. **Add Authentication**
   - Implement proper user login
   - Verify admin role from database
   - Use JWT tokens or sessions

2. **Protect Routes**
   - Add authentication middleware
   - Check user role before upload
   - Log all admin actions

3. **Validate Files**
   - Scan for malware
   - Verify file content
   - Limit file types strictly

4. **Rate Limiting**
   - Limit uploads per user
   - Prevent abuse
   - Monitor usage

### Current Implementation

⚠️ **Development Mode**
- Role stored in localStorage (client-side)
- No authentication required
- Anyone can set admin role
- **NOT suitable for production**

---

## 📞 Support

### Common Questions

**Q: Can students upload documents?**
A: No, only admins can upload. Students can only chat.

**Q: How many documents can I upload?**
A: No hard limit, but 10 files at once maximum.

**Q: What happens to old documents?**
A: They remain unless you delete them manually.

**Q: Can I delete documents?**
A: Currently, delete files manually from `/knowledge/` folder and re-run ingestion.

**Q: How long does processing take?**
A: Usually 1-5 seconds per document, depending on size.

---

## 🎯 Quick Reference

### Enable Admin
```javascript
localStorage.setItem('userRole', 'admin');
location.reload();
```

### Upload Flow
1. Knowledge Base → Select Category
2. Choose Files → Upload & Process
3. Wait for Success → Check Stats

### Test Upload
1. Chat View → Ask Question
2. Check Source Badge → Expand Context
3. Verify Document Listed

---

**Admin features are now ready to use!** 🚀
