# Questionário de levantamento e checklist de entrada

<p><img src="../landing/clarivo-mark.png" alt="" width="28" align="left"> <strong>Clarivo Dados</strong></p>
<br clear="left">

> Envie somente as perguntas relevantes. Para orçamento, peça de preferência cabeçalho das colunas ou amostra sintética, não a base real completa.

## A. Questionário inicial ao cliente

### Sobre o objetivo

- Empresa/segmento: [ ]
- Pessoa de contato e função: [ ]
- Qual pergunta de negócio quer responder? [ ]
- Que decisão será apoiada pelo relatório? [ ]
- Entrega desejada: [ ] PDF estático [ ] Dashboard local PBIX [ ] Raio-X da base
- Período a analisar: [ ]
- Data em que precisa receber: [ ]
- Quem receberá o material? [listar nomes/funções ou grupos autorizados]

### Sobre os dados

- Sistema ou planilha de origem: [ ]
- Quem consegue exportar o arquivo? [ ]
- Formato disponível: [ ] XLSX [ ] CSV [ ] outro: [ ]
- Quantas linhas e arquivos aproximadamente? [ ]
- A base mantém as mesmas colunas em cada fechamento? [ ]
- Quais campos são necessários para a pergunta? [ ]
- Como são definidos cancelamentos, devoluções, descontos e baixas? [ ]
- Há chaves de ligação entre arquivos? [ ]
- É possível retirar nomes, CPF, e-mail, telefone, endereço e dados sensíveis antes do envio? [ ]
- Os dados incluem informações de saúde, crianças, folha ou dados sensíveis? [ ] Não [ ] Sim — descrever somente o tipo, sem enviar registros.
- O cliente autoriza, e tem legitimidade para, compartilhar os campos estritamente necessários para este serviço? [ ] Confirmar com responsável

### Sobre o formato da entrega

- PDF: quantas páginas e quais indicadores? [ ]
- PBIX local: quem abrirá e confirma Windows/Power BI Desktop compatível? [ ]
- Se PBIX, todos os destinatários estão autorizados a ver os dados importados? [ ]
- Quem validará totais e fórmulas? [ ]
- Uma nova edição mensal é desejada? [ ] Não [ ] Talvez, orçamento separado

## B. Arquivo mínimo de exemplo

Para um relatório de vendas por produto, avaliar algo deste tipo:

```text
Data | Pedido_ID | Cliente_ID | Produto_ID | Vendedor_ID | Quantidade | Valor_liquido
```

O cliente mantém a tabela que relaciona IDs a pessoas em seu próprio ambiente. Um identificador substituto ainda pode ser dado pessoal se houver possibilidade razoável de reidentificação; protegê-lo e limitar acesso mesmo assim.

Outros exemplos:

- **Recebimentos:** `Titulo_ID | Contrato_ID | Competencia | Vencimento | Data_pagamento | Valor | Status`
- **Metas:** `Periodo | Equipe_ID | Meta`
- **Estoque:** `Data_corte | Produto_ID | Quantidade | Custo_unitario`, se custo for necessário e autorizado.

Não pedir credenciais, senha de ERP ou acesso administrativo. O cliente exporta e compartilha o arquivo acordado.

## C. Checklist de recebimento — preencher antes de abrir

- [ ] Proposta aprovada e pagamento inicial identificado.
- [ ] Contrato e anexo de dados preenchidos/revisados.
- [ ] Finalidade, período e campos aprovados por escrito.
- [ ] Cliente confirmou autorização e instruções de compartilhamento.
- [ ] Canal restrito acordado e destinatário confirmado.
- [ ] Estrutura da amostra confere com o escopo.
- [ ] Colunas pessoais/sensíveis desnecessárias removidas pelo cliente.
- [ ] Arquivos separados por cliente em localização de trabalho protegida.
- [ ] Cópia original preservada com acesso restrito, se necessária; não sobrescrever sem plano.
- [ ] Número de linhas, colunas, período e totais de controle registrados.
- [ ] Lista de arquivos recebidos e data de recebimento registrada.
- [ ] Prazo de devolução/descarte anotado no calendário.
- [ ] Nenhuma base real enviada a IA, conversor, site público ou outro fornecedor não avaliado.

Se qualquer controle essencial estiver pendente, suspenda o recebimento/tratamento e resolva antes.

## D. Registro de validação da base

- Projeto/cliente: [ ]
- Nome do arquivo e versão: [ ]
- Recebido em: [ ]
- Período e volume esperado: [ ]
- Volume e período encontrados: [ ]
- Total de controle fornecido pelo cliente: [ ]
- Total reproduzido: [ ]
- Regras aplicadas (cancelamentos, duplicidades, datas): [ ]
- Dados ausentes ou inconsistências: [ ]
- Suposições pendentes de confirmação: [ ]
- Resultado: [ ] apta [ ] apta com ressalvas aceitas por escrito [ ] suspensa
- Responsável do cliente que validou: [ ]
- Data e confirmação escrita: [ ]
