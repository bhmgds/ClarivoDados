# Clarivo Gestão — controle local

Um CRM pequeno, sem assinatura e sem dependências, para registrar contatos, propostas, projetos e próximos passos.

## Abrir

Na pasta do projeto, execute no terminal:

```bash
python3 gestao/serve.py
```

O navegador abrirá `http://127.0.0.1:8766`. Mantenha o terminal aberto enquanto usa o CRM; para encerrar, pressione `Ctrl+C`. O servidor é apenas de arquivos estáticos e escuta somente no próprio computador. Não requer instalação, internet, conta ou serviço externo.

## Fluxo de trabalho

1. Cadastre a empresa e o contato em **Contatos**; o sistema gera um código `CLI-NNNN`. Defina a etapa e a próxima data de acompanhamento.
2. Registre cada orçamento em **Propostas**. A referência `PROP-AAAA-NNNN` é gerada automaticamente; use-a no PDF. Preencha valor, validade, status e caminho do arquivo.
3. Ao aceitar uma proposta, abra-a e use **Criar projeto a partir desta proposta**. Cliente, proposta, serviço e valor são sugeridos; revise prazo e demais dados antes de salvar. Projetos recebem um código `PROJ-AAAA-NNNN`.
4. Registre follow-ups em **Próximos passos**. O painel mostra os atrasados e os que vencem nos próximos 14 dias.
5. Baixe periodicamente um **backup JSON** e exporte CSVs se quiser fazer análises no Excel.

## Onde ficam os dados

Os registros são guardados no armazenamento local do navegador, no perfil em que a página foi aberta. A página não envia registros a serviços externos. Se limpar os dados do navegador, trocar de perfil ou de computador, os registros não acompanham a mudança: restaure um backup JSON.

O backup JSON é texto legível, **não é criptografado** e contém tudo que foi digitado. Guarde-o em pasta protegida. Para manter documentos separados, use uma pasta local com acesso restrito por cliente/projeto e registre no sistema somente o caminho dessa pasta.

## O que não guardar aqui

O armazenamento do navegador não é criptografado pelo aplicativo. Mantenha o registro comercial mínimo: empresa, contato de trabalho, etapa, valores, datas e notas objetivas. E-mail e telefone de trabalho também podem ser dados pessoais; registre somente o necessário. **Não registre** CPF/CNPJ de pessoas, dados bancários, senhas, prontuários, dados sensíveis, bases recebidas, credenciais ou conteúdo confidencial detalhado. Não use em computador compartilhado. Use criptografia de disco e conta protegida no dispositivo.

Este é um controle operacional individual. Não substitui cópia de segurança, armazenamento seguro dos arquivos de clientes, contabilidade, contrato ou orientação jurídica. Faça backup antes de restaurar outro arquivo; a restauração substitui os registros atuais.
