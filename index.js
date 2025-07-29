const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post("/avaliar", (req, res) => {
  const respostas = req.body.respostas || [];
  const pontuacao = respostas.reduce((total, r) => total + parseInt(r || 0), 0);

  let nivel = "baixo";
  if (pontuacao >= 10 && pontuacao < 20) nivel = "moderado";
  else if (pontuacao >= 20) nivel = "alto";

  res.json({ pontuacao, nivel });
});

app.get("/", (req, res) => {
  res.send("Sentire API no ar!");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
