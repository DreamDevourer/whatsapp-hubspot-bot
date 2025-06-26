/**
 * Response templates WhatsApp bot
 * @param {Object} links - { scheduling, ebook } -> ou qualquer coisa...
 * eu sei que da forma que esta, eh muito simples, mas funciona por hora
 */
module.exports = {
  sim: (links) => `Obrigado pelo seu interesse!

Para agendar sua consulta virtual com nosso farmacêutico, clique no link abaixo:
${links.scheduling}

Qualquer dúvida, estou à disposição!`,

  nao: (links) => `Obrigado por nos dar a oportunidade!

Como agradecimento, temos um eBook exclusivo sobre cuidados com a saúde que você pode baixar gratuitamente:
${links.ebook}

Espero que seja útil para você!`,

  default: () => `Desculpe, não entendi sua resposta.
Por favor, responda com "Sim" ou "Não" para continuarmos.`,
};
