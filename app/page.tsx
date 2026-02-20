"use client";

import { id, init, tx } from "@instantdb/react";
import { useState } from "react";

const APP_ID = "d5f30c88-1366-443a-891c-2df14c770d66";

// Schema
const db = init({ appId: APP_ID });

type Recipe = {
  id: string;
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  imageUrl?: string;
  createdAt: number;
  authorEmail: string;
  authorId: string;
};

type Like = {
  id: string;
  recipeId: string;
  userId: string;
};

type Comment = {
  id: string;
  recipeId: string;
  text: string;
  authorEmail: string;
  createdAt: number;
};

export default function App() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

  // Autentifikacija
  const { isLoading: authLoading, user, error: authError } = db.useAuth();

  // Nuskaitome duomenis
  const { isLoading, error, data } = db.useQuery({
    recipes: {},
    likes: {},
    comments: {},
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-xl">Kraunama...</div>
      </div>
    );
  }

  if (error || authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-red-500">
          Klaida: {error?.message || authError?.message}
        </div>
      </div>
    );
  }

  // Jei neprisijungęs, rodyti prisijungimo formą
  if (!user) {
    return <LoginForm />;
  }

  const recipes = (data?.recipes || []) as Recipe[];
  const likes = (data?.likes || []) as Like[];
  const comments = (data?.comments || []) as Comment[];

  // Skaičiuojame patinka kiekvieno recepto
  const getLikesCount = (recipeId: string) => {
    return likes.filter((like) => like.recipeId === recipeId).length;
  };

  // Patikriname ar vartotojas jau paspaudė "patinka"
  const hasUserLiked = (recipeId: string) => {
    return likes.some(
      (like) => like.recipeId === recipeId && like.userId === user.id
    );
  };

  // Gauname komentarus kiekvienam receptui
  const getComments = (recipeId: string) => {
    return comments
      .filter((comment) => comment.recipeId === recipeId)
      .sort((a, b) => b.createdAt - a.createdAt);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">
            🍳 Receptų Platforma
          </h1>
          <p className="text-gray-600">
            Dalinkitės savo receptais ir atraskite naujus!
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="text-sm text-gray-600">
              Prisijungęs: {user.email}
            </span>
            <button
              onClick={() => db.auth.signOut()}
              className="text-sm text-red-600 hover:text-red-700 underline"
            >
              Atsijungti
            </button>
          </div>
        </div>

        {/* Sukurti naują receptą mygtukas */}
        <div className="mb-8 text-center">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg transition-all transform hover:scale-105"
          >
            {showCreateForm ? "✕ Uždaryti" : "+ Sukurti naują receptą"}
          </button>
        </div>

        {/* Recepto kūrimo forma */}
        {showCreateForm && (
          <CreateRecipeForm
            onClose={() => setShowCreateForm(false)}
            userEmail={user.email || ""}
            userId={user.id}
          />
        )}

        {/* Receptų sąrašas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-20">
              <p className="text-xl">Dar nėra receptų. Sukurkite pirmąjį!</p>
            </div>
          ) : (
            recipes
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  likesCount={getLikesCount(recipe.id)}
                  hasUserLiked={hasUserLiked(recipe.id)}
                  comments={getComments(recipe.id)}
                  isExpanded={expandedRecipe === recipe.id}
                  onToggleExpand={() =>
                    setExpandedRecipe(
                      expandedRecipe === recipe.id ? null : recipe.id
                    )
                  }
                  currentUserId={user.id}
                />
              ))
          )}
        </div>
      </div>
    </div>
  );
}

// Prisijungimo forma
function LoginForm() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    db.auth.sendMagicCode({ email }).catch((err) => {
      alert("Klaida siunčiant kodą: " + err.message);
    });
    setSent(true);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    db.auth.signInWithMagicCode({ email, code }).catch((err) => {
      alert("Neteisingas kodas arba kodas nebegalioja: " + err.message);
    });
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">📧</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Patikrinkite el. paštą!
            </h2>
            <p className="text-gray-600 mb-4">
              Išsiuntėme prisijungimo kodą į <strong>{email}</strong>
            </p>
          </div>
          
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Įveskite gautą kodą
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-center text-2xl tracking-widest"
                placeholder="000000"
                required
                maxLength={6}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Prisijungti
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={() => {
                setSent(false);
                setCode("");
              }}
              className="text-sm text-orange-500 hover:text-orange-600 underline"
            >
              Pakeisti el. paštą
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🍳 Receptų Platforma
          </h1>
          <p className="text-gray-600">
            Prisijunkite, kad galėtumėte dalintis receptais
          </p>
        </div>
        <form onSubmit={handleSendCode} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              El. paštas
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="jusu@elpastas.lt"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Siųsti prisijungimo kodą
          </button>
        </form>
        <p className="text-xs text-gray-500 text-center mt-4">
          Išsiųsime jums el. laišką su 6 skaitmenų kodu. Registracija nereikalinga!
        </p>
      </div>
    </div>
  );
}

// Recepto kortelė
function RecipeCard({
  recipe,
  likesCount,
  hasUserLiked,
  comments,
  isExpanded,
  onToggleExpand,
  currentUserId,
}: {
  recipe: Recipe;
  likesCount: number;
  hasUserLiked: boolean;
  comments: Comment[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  currentUserId: string;
}) {
  const handleLike = () => {
    if (hasUserLiked) {
      alert("Jūs jau paspaudėte 'patinka' šiam receptui!");
      return;
    }
    db.transact([
      tx.likes[id()].update({
        recipeId: recipe.id,
        userId: currentUserId,
      }),
    ]);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Nuotrauka */}
      {recipe.imageUrl && (
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full h-48 object-cover"
        />
      )}

      <div className="p-6">
        {/* Pavadinimas */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {recipe.title}
        </h2>

        {/* Aprašymas */}
        <p className="text-gray-600 mb-2">{recipe.description}</p>
        
        {/* Autorius */}
        <p className="text-xs text-gray-500 mb-4">
          👤 Autorius: {recipe.authorEmail}
        </p>

        {/* Patinka mygtukas */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={handleLike}
            disabled={hasUserLiked}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              hasUserLiked
                ? "bg-red-500 text-white cursor-not-allowed"
                : "bg-red-100 hover:bg-red-200 text-red-600"
            }`}
          >
            ❤️ {hasUserLiked ? "Patinka" : "Patinka"} ({likesCount})
          </button>
          <button
            onClick={onToggleExpand}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full transition-colors"
          >
            {isExpanded ? "Suskleisti" : "Plačiau"}
          </button>
        </div>

        {/* Išplėsta informacija */}
        {isExpanded && (
          <div className="border-t pt-4 space-y-4">
            {/* Ingredientai */}
            <div>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                Ingredientai:
              </h3>
              <p className="text-gray-700 whitespace-pre-line">
                {recipe.ingredients}
              </p>
            </div>

            {/* Gaminimo instrukcijos */}
            <div>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                Gaminimo instrukcijos:
              </h3>
              <p className="text-gray-700 whitespace-pre-line">
                {recipe.instructions}
              </p>
            </div>

            {/* Komentarai */}
            <CommentSection recipeId={recipe.id} comments={comments} />
          </div>
        )}
      </div>
    </div>
  );
}

// Komentarų sekcija
function CommentSection({
  recipeId,
  comments,
}: {
  recipeId: string;
  comments: Comment[];
}) {
  const [newComment, setNewComment] = useState("");
  const { user } = db.useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    db.transact([
      tx.comments[id()].update({
        recipeId,
        text: newComment,
        authorEmail: user.email || "",
        createdAt: Date.now(),
      }),
    ]);

    setNewComment("");
  };

  return (
    <div className="border-t pt-4">
      <h3 className="font-semibold text-lg text-gray-800 mb-3">
        Komentarai ({comments.length})
      </h3>

      {/* Komentarų forma */}
      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <textarea
          placeholder="Parašykite komentarą..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
          rows={3}
        />
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Komentuoti
        </button>
      </form>

      {/* Komentarų sąrašas */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-800">
                {comment.authorEmail}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(comment.createdAt).toLocaleDateString("lt-LT")}
              </span>
            </div>
            <p className="text-gray-700">{comment.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Naujo recepto kūrimo forma
function CreateRecipeForm({
  onClose,
  userEmail,
  userId,
}: {
  onClose: () => void;
  userEmail: string;
  userId: string;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Konvertuojame į base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    db.transact([
      tx.recipes[id()].update({
        title,
        description,
        ingredients,
        instructions,
        imageUrl: imageUrl || undefined,
        createdAt: Date.now(),
        authorEmail: userEmail,
        authorId: userId,
      }),
    ]);

    // Išvalome formą
    setTitle("");
    setDescription("");
    setIngredients("");
    setInstructions("");
    setImageUrl("");
    setImageFile(null);
    onClose();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Sukurti naują receptą
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Pavadinimas */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Pavadinimas *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Pvz., Šokoladinis tortas"
            required
          />
        </div>

        {/* Aprašymas */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Aprašymas *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            rows={3}
            placeholder="Trumpas recepto aprašymas..."
            required
          />
        </div>

        {/* Ingredientai */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Ingredientai
          </label>
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            rows={5}
            placeholder="Pvz.:&#10;- 200g miltų&#10;- 100g cukraus&#10;- 3 kiaušiniai"
          />
        </div>

        {/* Gaminimo instrukcijos */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Gaminimo instrukcijos
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            rows={6}
            placeholder="Detalūs gaminimo žingsniai..."
          />
        </div>

        {/* Nuotrauka */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Nuotrauka
          </label>
          <div className="space-y-3">
            {/* URL įvedimas */}
            <input
              type="url"
              value={imageFile ? "" : imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={!!imageFile}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Arba įveskite nuotraukos URL"
            />

            {/* Arba */}
            <div className="text-center text-gray-500">arba</div>

            {/* Failo įkėlimas */}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Nuotraukos peržiūra */}
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Peržiūra"
              className="mt-3 w-full h-48 object-cover rounded-lg"
            />
          )}
        </div>

        {/* Mygtukai */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Sukurti receptą
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Atšaukti
          </button>
        </div>
      </form>
    </div>
  );
}
