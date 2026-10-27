// Contrat de données du prototype : localStorage keys maro_p (produits) et maro_s (réglages).
// Les structures restent compatibles avec index.html. La connexion Supabase sera ajoutée plus tard.
const supabaseUrl = 'https://shzcygvpeziwdvfsxhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoemN5Z3ZwZXppd2R2ZnN4aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxMjU3NjQsImV4cCI6MjEwODcwMTc2NH0.hvI0Y_iseUuwprT13mNeKt7ahNJVSTXSMABt01PPKis'; 
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
