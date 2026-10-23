(() => {
  "use strict";

  const STORAGE_KEY = "clarivo-gestao-v1";
  const DB_VERSION = 1;
  const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const today = () => dateKey(new Date());
  const uid = () => crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const entities = ["clients", "proposals", "projects", "tasks"];
  const entityNames = {
    clients: "Contato",
    proposals: "Proposta",
    projects: "Projeto",
    tasks: "Próximo passo",
  };
  const viewNames = {
    dashboard: "Visão geral",
    clients: "Contatos",
    proposals: "Propostas",
    projects: "Projetos",
    tasks: "Próximos passos",
    help: "Como usar",
  };
  let storageReady = true;
  const fields = {
    clients: [
      { key: "code", label: "Código do cliente", type: "text", readonly: true, autoCode: true, help: "Gerado automaticamente pelo sistema." },
      { key: "company", label: "Empresa / negócio", type: "text", required: true, full: true },
      { key: "contact", label: "Pessoa de contato", type: "text" },
      { key: "segment", label: "Segmento", type: "select", options: ["Escritório contábil", "Clínica", "Advocacia", "Indústria", "Distribuição", "Transportes", "Serviços", "E-commerce", "Negócio familiar", "Outro"] },
      { key: "source", label: "Origem do contato", type: "select", options: ["Indicação", "Networking", "Prospecção local", "Workana", "99Freelas", "Site", "Outro"] },
      { key: "stage", label: "Etapa comercial", type: "select", required: true, options: ["Novo contato", "Conversa marcada", "Qualificação", "Proposta enviada", "Cliente ativo", "Sem avanço"] },
      { key: "email", label: "E-mail comercial (opcional)", type: "email" },
      { key: "phone", label: "Telefone comercial (opcional)", type: "tel" },
      { key: "lastContact", label: "Último contato", type: "date" },
      { key: "nextFollowUp", label: "Próximo acompanhamento", type: "date" },
      { key: "notes", label: "Notas comerciais", type: "textarea", full: true, help: "Não registre dados sensíveis, credenciais ou conteúdo detalhado de clientes." },
    ],
    proposals: [
      { key: "number", label: "Referência da proposta", type: "text", required: true, readonly: true, autoCode: true, help: "Gerada automaticamente; use esta referência no PDF da proposta." },
      { key: "clientId", label: "Empresa", type: "relation", entity: "clients", required: true },
      { key: "service", label: "Serviço", type: "select", required: true, options: ["Raio-X de dados", "Relatório gerencial PDF", "Dashboard Power BI local", "Edição mensal de relatório", "Outro"] },
      { key: "value", label: "Valor proposto (R$)", type: "number", min: "0", step: "0.01" },
      { key: "date", label: "Data da proposta", type: "date" },
      { key: "validUntil", label: "Validade", type: "date" },
      { key: "status", label: "Status", type: "select", required: true, options: ["Rascunho", "Enviada", "Em negociação", "Aceita", "Recusada", "Expirada"] },
      { key: "filePath", label: "Caminho do arquivo", type: "text", full: true, help: "Ex.: Clientes/Empresa/01-Comercial/proposta.pdf" },
      { key: "notes", label: "Notas e próximo movimento", type: "textarea", full: true },
    ],
    projects: [
      { key: "code", label: "Código do projeto", type: "text", readonly: true, autoCode: true, help: "Gerado automaticamente pelo sistema." },
      { key: "title", label: "Nome do projeto", type: "text", required: true, full: true },
      { key: "clientId", label: "Empresa", type: "relation", entity: "clients", required: true },
      { key: "proposalId", label: "Proposta relacionada", type: "relation", entity: "proposals", optional: true },
      { key: "status", label: "Status", type: "select", required: true, options: ["Aguardando início", "Em andamento", "Aguardando cliente", "Em revisão", "Concluído", "Cancelado"] },
      { key: "startDate", label: "Início", type: "date" },
      { key: "dueDate", label: "Prazo combinado", type: "date" },
      { key: "deliveredDate", label: "Data de entrega", type: "date" },
      { key: "price", label: "Valor contratado (R$)", type: "number", min: "0", step: "0.01" },
      { key: "paid", label: "Valor recebido (R$)", type: "number", min: "0", step: "0.01" },
      { key: "folderPath", label: "Pasta dos documentos", type: "text", full: true, help: "Guarde arquivos fora do CRM, em pasta local protegida." },
      { key: "nextStep", label: "Próxima ação", type: "textarea", full: true },
    ],
    tasks: [
      { key: "title", label: "Tarefa / próximo passo", type: "text", required: true, full: true },
      { key: "clientId", label: "Empresa relacionada", type: "relation", entity: "clients", optional: true },
      { key: "projectId", label: "Projeto relacionado", type: "relation", entity: "projects", optional: true },
      { key: "dueDate", label: "Data para concluir", type: "date", required: true },
      { key: "priority", label: "Prioridade", type: "select", required: true, options: ["Normal", "Alta"] },
      { key: "status", label: "Status", type: "select", required: true, options: ["Pendente", "Concluída"] },
      { key: "notes", label: "Notas", type: "textarea", full: true },
    ],
  };

  const columns = {
    clients: [
      { key: "code", label: "Código", primary: true },
      { key: "company", label: "Empresa", primary: true },
      { key: "contact", label: "Contato" },
      { key: "segment", label: "Segmento" },
      { key: "stage", label: "Etapa", badge: true },
      { key: "source", label: "Origem" },
      { key: "nextFollowUp", label: "Próximo contato", date: true },
    ],
    proposals: [
      { key: "number", label: "Referência", primary: true },
      { key: "clientId", label: "Empresa", relation: "clients", primary: true },
      { key: "service", label: "Serviço" },
      { key: "value", label: "Valor", money: true },
      { key: "date", label: "Enviada em", date: true },
      { key: "validUntil", label: "Validade", date: true },
      { key: "status", label: "Status", badge: true },
    ],
    projects: [
      { key: "code", label: "Código" },
      { key: "title", label: "Projeto", primary: true },
      { key: "clientId", label: "Empresa", relation: "clients" },
      { key: "status", label: "Status", badge: true },
      { key: "dueDate", label: "Prazo", date: true },
      { key: "price", label: "Contratado", money: true },
      { key: "paid", label: "Recebido", money: true },
      { key: "balance", label: "Saldo a receber", money: true },
    ],
    tasks: [
      { key: "title", label: "Tarefa", primary: true },
      { key: "clientId", label: "Empresa", relation: "clients" },
      { key: "dueDate", label: "Data", date: true },
      { key: "priority", label: "Prioridade", badge: true },
      { key: "status", label: "Status", badge: true },
    ],
  };

  const state = loadState();
  const notice = document.querySelector("#notice");
  const dialog = document.querySelector("#record-dialog");
  let activeEntity = null;
  let editingId = null;
  let noticeTimer;

  function emptyState() {
    return { version: DB_VERSION, clients: [], proposals: [], projects: [], tasks: [], sequences: { clients: 0, proposals: {}, projects: {} } };
  }

  function normalizeSequences(data) {
    data.sequences = data.sequences && typeof data.sequences === "object" ? data.sequences : {};
    data.sequences.clients = Math.max(Number(data.sequences.clients || 0), ...data.clients.map((item) => Number((String(item.code || "").match(/CLI-(\d+)/) || [])[1] || 0)));
    data.sequences.proposals = data.sequences.proposals && typeof data.sequences.proposals === "object" ? data.sequences.proposals : {};
    data.sequences.projects = data.sequences.projects && typeof data.sequences.projects === "object" ? data.sequences.projects : {};
    for (const year of new Set([...data.proposals.map((item) => String(item.number || "").match(/^PROP-(\d{4})-/)?.[1]), ...Object.keys(data.sequences.proposals)])) {
      if (!year) continue;
      const maxExisting = Math.max(0, ...data.proposals.filter((item) => String(item.number || "").startsWith("PROP-" + year + "-")).map((item) => Number((String(item.number || "").match(/-(\d+)$/) || [])[1] || 0)));
      data.sequences.proposals[year] = Math.max(Number(data.sequences.proposals[year] || 0), maxExisting);
    }
    for (const year of new Set([...data.projects.map((item) => String(item.code || "").match(/^PROJ-(\d{4})-/)?.[1]), ...Object.keys(data.sequences.projects)])) {
      if (!year) continue;
      const maxExisting = Math.max(0, ...data.projects.filter((item) => String(item.code || "").startsWith("PROJ-" + year + "-")).map((item) => Number((String(item.code || "").match(/-(\d+)$/) || [])[1] || 0)));
      data.sequences.projects[year] = Math.max(Number(data.sequences.projects[year] || 0), maxExisting);
    }
    return data;
  }

  function nextCode(entity) {
    const year = String(new Date().getFullYear());
    if (entity === "clients") {
      const maxExisting = Math.max(0, ...state.clients.map((item) => Number((String(item.code || "").match(/^CLI-(\d+)$/) || [])[1] || 0)));
      return "CLI-" + String(Math.max(Number(state.sequences?.clients || 0), maxExisting) + 1).padStart(4, "0");
    }
    const prefix = entity === "proposals" ? "PROP" : "PROJ";
    const collection = state[entity] || [];
    const key = entity === "proposals" ? "number" : "code";
    const maxExisting = Math.max(0, ...collection.filter((item) => String(item[key] || "").startsWith(prefix + "-" + year + "-")).map((item) => Number((String(item[key] || "").match(/-(\d+)$/) || [])[1] || 0)));
    const saved = Number(state.sequences?.[entity]?.[year] || 0);
    return prefix + "-" + year + "-" + String(Math.max(saved, maxExisting) + 1).padStart(4, "0");
  }

  function advanceSequence(entity, code) {
    if (entity === "clients") {
      state.sequences.clients = Math.max(Number(state.sequences.clients || 0), Number((String(code || "").match(/^CLI-(\d+)$/) || [])[1] || 0));
      return;
    }
    const prefix = entity === "proposals" ? "PROP" : "PROJ";
    const match = String(code || "").match(new RegExp("^" + prefix + "-(\\d{4})-(\\d+)$"));
    if (!match) return;
    state.sequences[entity] = state.sequences[entity] || {};
    state.sequences[entity][match[1]] = Math.max(Number(state.sequences[entity][match[1]] || 0), Number(match[2]));
  }

  function migrateLegacyCodes() {
    let changed = false;
    for (const client of state.clients) {
      if (!client.code) { client.code = nextCode("clients"); advanceSequence("clients", client.code); changed = true; }
    }
    for (const proposal of state.proposals) {
      if (!proposal.number) { proposal.number = nextCode("proposals"); advanceSequence("proposals", proposal.number); changed = true; }
    }
    for (const project of state.projects) {
      if (!project.code) { project.code = nextCode("projects"); advanceSequence("projects", project.code); changed = true; }
    }
    return changed;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyState();
      const parsed = JSON.parse(raw);
      validateBackup(parsed);
      return normalizeSequences(parsed);
    } catch (error) {
      console.error("Não foi possível carregar os registros locais.", error);
      storageReady = false;
      window.addEventListener("DOMContentLoaded", () => showNotice("Não foi possível ler os registros salvos. Exporte ou restaure um backup válido antes de continuar.", true));
      return emptyState();
    }
  }

  function validateBackup(data) {
    if (!data || data.version !== DB_VERSION) throw new Error("Versão de backup incompatível.");
    for (const entity of entities) {
      if (!Array.isArray(data[entity])) throw new Error(`Lista inválida: ${entity}.`);
      const ids = new Set();
      for (const item of data[entity]) {
        if (!item || typeof item.id !== "string" || !item.id || ids.has(item.id)) {
          throw new Error(`Registro inválido ou ID repetido em ${entity}.`);
        }
        ids.add(item.id);
      }
    }
  }

  function saveState() {
    if (!storageReady) {
      showNotice("O armazenamento atual não pôde ser carregado. Restaure um backup válido antes de salvar novos registros.", true);
      return false;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Não foi possível salvar os registros locais.", error);
      showNotice("Falha ao salvar. Exporte um backup e libere espaço no navegador antes de continuar.", true);
      return false;
    }
    return true;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[char]);
  }

  function formatDate(value) {
    if (!value) return "—";
    const parts = value.split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return value;
    return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString("pt-BR");
  }

  function formatMoney(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return "—";
    return amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function getById(entity, id) {
    return state[entity].find((item) => item.id === id);
  }

  function clientName(id) {
    return getById("clients", id)?.company || "—";
  }

  function relationLabel(entity, record) {
    if (!record) return "—";
    if (entity === "clients") return record.company || "Contato removido";
    if (entity === "proposals") return `${clientName(record.clientId)} · ${record.service || "Proposta"}`;
    if (entity === "projects") return `${clientName(record.clientId)} · ${record.title || "Projeto"}`;
    return record.title || "Registro";
  }

  function showNotice(message, isError = false) {
    notice.textContent = message;
    notice.hidden = false;
    notice.classList.toggle("error", isError);
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => { notice.hidden = true; }, 4500);
  }

  function render() {
    renderTables();
    renderDashboard();
    document.querySelectorAll(".view.active").forEach((view) => {
      document.querySelector("#breadcrumb").textContent = `Painel / ${viewNames[view.id.replace("view-", "")]}`;
    });
  }

  function renderTables() {
    for (const entity of entities) {
      const head = document.querySelector(`#head-${entity}`);
      const body = document.querySelector(`#body-${entity}`);
      if (!head || !body) continue;
      head.innerHTML = `<tr>${columns[entity].map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}<th>Ações</th></tr>`;
      const query = document.querySelector(`[data-search="${entity}"]`).value.trim().toLocaleLowerCase("pt-BR");
      const filtered = state[entity].filter((item) => {
        const searchable = [item.number, item.title, item.company, item.contact, item.segment, item.stage, item.service, item.status, item.notes, item.source, item.email, item.phone, item.nextStep, clientName(item.clientId)]
          .filter(Boolean).join(" ").toLocaleLowerCase("pt-BR");
        return searchable.includes(query);
      }).sort((a, b) => (b.updatedAt || b.createdAt || "").localeCompare(a.updatedAt || a.createdAt || ""));
      if (!filtered.length) {
        body.innerHTML = `<tr><td class="empty-state" colspan="${columns[entity].length + 1}">${state[entity].length ? "Nenhum registro corresponde à busca." : `Ainda não há registros. Use “＋ ${escapeHtml(entityNames[entity])}” para começar.`}</td></tr>`;
      } else {
        body.innerHTML = filtered.map((item) => `<tr>${columns[entity].map((column) => {
          let value = item[column.key];
          if (column.key === "balance") value = Math.max(0, Number(item.price || 0) - Number(item.paid || 0));
          else if (column.relation) value = relationLabel(column.relation, getById(column.relation, value));
          else if (column.date) value = formatDate(value);
          else if (column.money) value = formatMoney(value);
          const badge = column.badge ? `<span class="status-pill ${badgeTone(String(value || ""))}">${escapeHtml(value || "—")}</span>` : escapeHtml(value || "—");
          return `<td class="${column.primary ? "primary-cell" : ""}">${badge}</td>`;
        }).join("")}<td><div class="row-actions"><button class="row-action" data-edit="${entity}" data-id="${escapeHtml(item.id)}">Editar</button><button class="row-action delete" data-delete="${entity}" data-id="${escapeHtml(item.id)}">Excluir</button></div></td></tr>`).join("");
      }
      document.querySelector(`#footer-${entity}`).textContent = `${filtered.length} de ${state[entity].length} registro(s)`;
    }
  }

  function badgeTone(value) {
    if (["Aceita", "Cliente ativo", "Concluída", "Concluído"].includes(value)) return "good";
    if (["Em negociação", "Enviada", "Aguardando cliente", "Alta", "Proposta enviada"].includes(value)) return "warn";
    if (["Recusada", "Expirada", "Cancelado", "Sem avanço"].includes(value)) return "bad";
    if (["Em andamento", "Qualificação", "Conversa marcada", "Em revisão"].includes(value)) return "info";
    return "";
  }

  function renderDashboard() {
    const openProposals = state.proposals.filter((item) => ["Enviada", "Em negociação"].includes(item.status));
    const activeProjects = state.projects.filter((item) => !["Concluído", "Cancelado"].includes(item.status));
    const outstanding = state.projects.reduce((sum, item) => sum + Math.max(0, Number(item.price || 0) - Number(item.paid || 0)), 0);
    const openValue = openProposals.reduce((sum, item) => sum + Number(item.value || 0), 0);
    const metrics = [
      ["Contatos ativos", state.clients.filter((item) => !["Sem avanço"].includes(item.stage)).length, "Oportunidades e clientes"],
      ["Propostas em aberto", openProposals.length, formatMoney(openValue) + " em negociação"],
      ["Projetos em andamento", activeProjects.length, "Inclui projetos aguardando o cliente"],
      ["Valores a receber", formatMoney(outstanding), "Saldo registrado nos projetos"],
    ];
    document.querySelector("#metrics").innerHTML = metrics.map(([label, value, hint]) => `<article class="metric-card"><div class="metric-label">${escapeHtml(label)}</div><div class="metric-value">${escapeHtml(value)}</div><div class="metric-hint">${escapeHtml(hint)}</div></article>`).join("");

    const current = today();
    const limit = new Date();
    limit.setDate(limit.getDate() + 14);
    const limitDate = dateKey(limit);
    const taskReminders = state.tasks.filter((task) => task.status !== "Concluída" && task.dueDate && task.dueDate <= limitDate)
      .map((task) => ({ title: task.title, subtitle: `${clientName(task.clientId)} · ${task.priority || "Normal"}`, date: task.dueDate }));
    const clientReminders = state.clients.filter((client) => !["Sem avanço"].includes(client.stage) && client.nextFollowUp && client.nextFollowUp <= limitDate)
      .map((client) => ({ title: `Acompanhar ${client.company}`, subtitle: client.contact || "Contato comercial", date: client.nextFollowUp }));
    const due = [...taskReminders, ...clientReminders].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
    const dueList = document.querySelector("#due-tasks");
    dueList.innerHTML = due.length ? due.map((task) => {
      const overdue = task.date < current;
      return `<div class="compact-item"><div><div class="compact-title">${escapeHtml(task.title)}</div><div class="compact-meta">${escapeHtml(task.subtitle)}</div></div><div class="compact-date ${overdue ? "overdue" : ""}">${overdue ? "Atrasada · " : ""}${formatDate(task.date)}</div></div>`;
    }).join("") : `<div class="empty-state">Sem tarefas vencidas ou próximas. Registre follow-ups na área “Próximos passos”.</div>`;

    const proposalStages = ["Rascunho", "Enviada", "Em negociação", "Aceita", "Recusada", "Expirada"];
    const pipeline = document.querySelector("#pipeline");
    const maxCount = Math.max(1, ...proposalStages.map((status) => state.proposals.filter((item) => item.status === status).length));
    pipeline.innerHTML = proposalStages.map((status) => {
      const matching = state.proposals.filter((item) => item.status === status);
      const amount = matching.reduce((sum, item) => sum + Number(item.value || 0), 0);
      const width = matching.length ? Math.max(5, Math.min(100, Math.round(matching.length / maxCount * 20) * 5)) : 0;
      return `<div class="pipeline-row"><div class="pipeline-label">${escapeHtml(status)} <strong>(${matching.length})</strong></div><div class="pipeline-track"><div class="pipeline-fill w-${width}"></div></div><div class="pipeline-value">${escapeHtml(formatMoney(amount))}</div></div>`;
    }).join("");
  }

  function makeSelect(field, value) {
    let options = field.options || [];
    if (field.type === "relation") {
      options = state[field.entity].map((item) => ({ value: item.id, label: relationLabel(field.entity, item) }));
      if (!options.length) return `<select name="${field.key}" ${field.required ? "required" : ""}><option value="">Cadastre primeiro</option></select>`;
      return `<select name="${field.key}" ${field.required ? "required" : ""}><option value="">${field.required ? "Selecione…" : "Nenhum"}</option>${options.map((option) => `<option value="${escapeHtml(option.value)}" ${value === option.value ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}</select>`;
    }
    return `<select name="${field.key}" ${field.required ? "required" : ""}><option value="">Selecione…</option>${options.map((option) => `<option value="${escapeHtml(option)}" ${value === option ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select>`;
  }

  function openForm(entity, id = null) {
    if (!entities.includes(entity)) return;
    activeEntity = entity;
    editingId = id;
    const record = id ? getById(entity, id) : {};
    if (id && !record) {
      showNotice("Este registro não foi encontrado.", true);
      return;
    }
    document.querySelector("#form-eyebrow").textContent = editingId ? "EDITAR REGISTRO" : "NOVO REGISTRO";
    document.querySelector("#form-title").textContent = `${editingId ? "Editar" : "Novo"} ${entityNames[entity].toLocaleLowerCase("pt-BR")}`;
    document.querySelector("#form-fields").innerHTML = fields[entity].map((field) => {
      const value = record[field.key] ?? (field.autoCode && !id ? nextCode(entity) : (entity === "proposals" && field.key === "date" && !id ? today() : ""));
      const label = `<label for="field-${field.key}">${escapeHtml(field.label)}${field.required ? " *" : ""}</label>`;
      let control;
      if (field.type === "select" || field.type === "relation") control = makeSelect(field, value);
      else if (field.type === "textarea") control = `<textarea name="${field.key}" id="field-${field.key}" ${field.required ? "required" : ""} maxlength="1200">${escapeHtml(value)}</textarea>`;
      else control = `<input name="${field.key}" id="field-${field.key}" type="${field.type}" value="${escapeHtml(value)}" ${field.required ? "required" : ""} ${field.readonly ? "readonly" : ""} ${field.min ? `min="${field.min}"` : ""} ${field.step ? `step="${field.step}"` : ""} maxlength="240">`;
      return `<div class="field ${field.full ? "full" : ""}">${label}${control}${field.help ? `<span class="help-text">${escapeHtml(field.help)}</span>` : ""}</div>`;
    }).join("");
    if (entity === "proposals" && id && record.status === "Aceita" && !state.projects.some((project) => project.proposalId === record.id)) {
      document.querySelector("#form-fields").insertAdjacentHTML("beforeend", `<div class="field full"><button type="button" class="button button-quiet" data-create-project-from-proposal="${escapeHtml(record.id)}">Criar projeto a partir desta proposta</button></div>`);
    }
    dialog.showModal();
    dialog.querySelector("input,select,textarea")?.focus();
  }

  function collectRecord(form, entity, currentRecord) {
    const formData = new FormData(form);
    const record = { ...(currentRecord || {}) };
    for (const field of fields[entity]) {
      const raw = formData.get(field.key);
      record[field.key] = field.type === "number" ? (raw === "" ? "" : Number(raw)) : String(raw || "").trim();
    }
    const timestamp = new Date().toISOString();
    record.id = currentRecord?.id || uid();
    record.createdAt = currentRecord?.createdAt || timestamp;
    record.updatedAt = timestamp;
    return record;
  }

  function syncRelatedFields(changedName) {
    const form = document.querySelector("#record-form");
    const clientSelect = form.elements.clientId;
    const proposalSelect = form.elements.proposalId;
    const projectSelect = form.elements.projectId;
    if (activeEntity === "projects" && changedName === "proposalId" && proposalSelect?.value) {
      const proposal = getById("proposals", proposalSelect.value);
      if (proposal) {
        if (clientSelect) clientSelect.value = proposal.clientId || "";
        const title = form.elements.title;
        if (title && !title.value.trim()) title.value = proposal.service || "";
        const price = form.elements.price;
        if (price && price.value === "" && proposal.value !== "") price.value = proposal.value;
      }
    }
    if (activeEntity === "tasks" && changedName === "projectId" && projectSelect?.value) {
      const project = getById("projects", projectSelect.value);
      if (project && clientSelect) clientSelect.value = project.clientId || "";
    }
    if (activeEntity === "tasks" && changedName === "clientId" && projectSelect?.value) {
      const project = getById("projects", projectSelect.value);
      if (project && project.clientId !== clientSelect?.value) projectSelect.value = "";
    }
  }

  function createProjectFromProposal(proposalId) {
    const proposal = getById("proposals", proposalId);
    if (!proposal || proposal.status !== "Aceita") return;
    if (state.projects.some((project) => project.proposalId === proposalId)) {
      showNotice("Já existe um projeto vinculado a esta proposta.", true);
      return;
    }
    dialog.close();
    openForm("projects");
    const form = document.querySelector("#record-form");
    if (form.elements.clientId) form.elements.clientId.value = proposal.clientId || "";
    if (form.elements.proposalId) form.elements.proposalId.value = proposal.id;
    if (form.elements.title) form.elements.title.value = proposal.service || "";
    if (form.elements.price && proposal.value !== "") form.elements.price.value = proposal.value;
    if (form.elements.status) form.elements.status.value = "Aguardando início";
  }

  function saveForm(event) {
    event.preventDefault();
    if (!activeEntity || !event.currentTarget.reportValidity()) return;
    const current = editingId ? getById(activeEntity, editingId) : null;
    const record = collectRecord(event.currentTarget, activeEntity, current);
    const previousState = JSON.stringify(state);
    if (!editingId && ["clients", "proposals", "projects"].includes(activeEntity)) {
      const key = activeEntity === "clients" ? "code" : (activeEntity === "proposals" ? "number" : "code");
      record[key] = nextCode(activeEntity);
    }
    if (activeEntity === "proposals" && !record.date) record.date = today();
    if (activeEntity === "projects" && record.status === "Concluído" && !record.deliveredDate) record.deliveredDate = today();
    if (activeEntity === "tasks" && record.projectId) {
      const linkedProject = getById("projects", record.projectId);
      if (linkedProject && !record.clientId) record.clientId = linkedProject.clientId;
      if (linkedProject && record.clientId !== linkedProject.clientId) {
        showNotice("A tarefa e o projeto precisam pertencer ao mesmo cliente.", true);
        return;
      }
    }
    if (activeEntity === "projects" && Number(record.paid || 0) > Number(record.price || 0)) {
      showNotice("O valor recebido não pode ser maior que o valor contratado.", true);
      return;
    }
    if (activeEntity === "projects" && record.proposalId) {
      const proposal = getById("proposals", record.proposalId);
      if (proposal && proposal.clientId !== record.clientId) {
        showNotice("A proposta escolhida pertence a outra empresa.", true);
        return;
      }
    }
    if (activeEntity === "proposals" && state.proposals.some((item) => item.number === record.number && item.id !== record.id)) {
      showNotice("Já existe uma proposta com essa referência.", true);
      return;
    }
    if (activeEntity === "proposals" && record.status === "Aceita") {
      const client = getById("clients", record.clientId);
      if (client && client.stage !== "Cliente ativo") {
        client.stage = "Cliente ativo";
        client.updatedAt = new Date().toISOString();
      }
    }
    if (editingId) {
      const index = state[activeEntity].findIndex((item) => item.id === editingId);
      state[activeEntity][index] = record;
    } else {
      state[activeEntity].push(record);
    }
    if (!editingId && ["clients", "proposals", "projects"].includes(activeEntity)) {
      const key = activeEntity === "clients" ? "code" : (activeEntity === "proposals" ? "number" : "code");
      advanceSequence(activeEntity, record[key]);
    }
    if (!saveState()) {
      Object.assign(state, JSON.parse(previousState));
      return;
    }
    dialog.close();
    showNotice(`${entityNames[activeEntity]} ${editingId ? "atualizado" : "salvo"} com sucesso.`);
    render();
  }

  function deleteRecord(entity, id) {
    const relationInUse = {
      clients: state.proposals.some((item) => item.clientId === id) || state.projects.some((item) => item.clientId === id) || state.tasks.some((item) => item.clientId === id),
      proposals: state.projects.some((item) => item.proposalId === id),
      projects: state.tasks.some((item) => item.projectId === id),
      tasks: false,
    }[entity];
    if (relationInUse) {
      showNotice("Este registro está relacionado a outros. Atualize ou remova os vínculos antes de excluir.", true);
      return;
    }
    const record = getById(entity, id);
    if (!record || !window.confirm(`Excluir ${entityNames[entity].toLocaleLowerCase("pt-BR")} “${relationLabel(entity, record)}”? Esta ação não pode ser desfeita.`)) return;
    const previousState = JSON.stringify(state);
    state[entity] = state[entity].filter((item) => item.id !== id);
    if (!saveState()) {
      Object.assign(state, JSON.parse(previousState));
      return;
    }
    showNotice("Registro excluído.");
    render();
  }

  function downloadBlob(blob, name) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  function exportBackup() {
    const backup = {
      ...state,
      exportedAt: new Date().toISOString(),
      application: "Clarivo Gestão local",
    };
    const date = today();
    downloadBlob(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }), `clarivo-backup-${date}.json`);
    showNotice("Backup baixado. Guarde-o em local protegido; o JSON não é criptografado.");
  }

  async function importBackup(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showNotice("O arquivo excede o limite de 5 MB.", true);
      return;
    }
    try {
      const backup = JSON.parse(await file.text());
      validateBackup(backup);
      if (!window.confirm("Restaurar este backup substituirá todos os registros atuais. Faça um backup atual antes de continuar. Deseja restaurar?")) return;
      const previousState = JSON.stringify(state);
      for (const entity of entities) state[entity] = backup[entity];
      state.sequences = normalizeSequences(backup).sequences;
      migrateLegacyCodes();
      storageReady = true;
      if (!saveState()) {
        Object.assign(state, JSON.parse(previousState));
        return;
      }
      render();
      showNotice("Backup restaurado com sucesso.");
    } catch (error) {
      console.error("Falha ao restaurar backup.", error);
      showNotice("Não foi possível restaurar. Verifique se o arquivo é um backup válido da Clarivo Gestão.", true);
    }
  }

  function csvCell(value) {
    let text = String(value ?? "");
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  }

  function exportCsv(entity) {
    const labels = columns[entity];
    const rows = state[entity].map((item) => labels.map((column) => {
      let value = item[column.key] ?? "";
      if (column.key === "balance") value = Math.max(0, Number(item.price || 0) - Number(item.paid || 0));
      if (column.relation) value = relationLabel(column.relation, getById(column.relation, value));
      if (column.date) value = formatDate(value);
      if (column.money) value = Number(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
      return csvCell(value);
    }).concat(csvCell(item.notes || item.nextStep || item.filePath || item.folderPath || "")).join(";"));
    const header = labels.map((column) => csvCell(column.label)).concat(csvCell("Notas / caminho")).join(";");
    const content = `\uFEFF${[header, ...rows].join("\r\n")}`;
    downloadBlob(new Blob([content], { type: "text/csv;charset=utf-8" }), `clarivo-${entity}-${today()}.csv`);
  }

  function switchView(view) {
    if (!viewNames[view]) return;
    document.querySelectorAll(".view").forEach((section) => section.classList.toggle("active", section.id === `view-${view}`));
    document.querySelectorAll(".main-nav [data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
    document.querySelector("#breadcrumb").textContent = `Painel / ${viewNames[view]}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-view]");
    if (button) switchView(button.dataset.view);
    const create = event.target.closest("[data-create]");
    if (create) openForm(create.dataset.create);
    const edit = event.target.closest("[data-edit]");
    if (edit) openForm(edit.dataset.edit, edit.dataset.id);
    const remove = event.target.closest("[data-delete]");
    if (remove) deleteRecord(remove.dataset.delete, remove.dataset.id);
    const createProject = event.target.closest("[data-create-project-from-proposal]");
    if (createProject) createProjectFromProposal(createProject.dataset.createProjectFromProposal);
    const exportCsvButton = event.target.closest("[data-export-csv]");
    if (exportCsvButton) exportCsv(exportCsvButton.dataset.exportCsv);
  });

  document.querySelectorAll("[data-search]").forEach((input) => input.addEventListener("input", renderTables));
  document.querySelector("#record-form").addEventListener("submit", saveForm);
  document.querySelector("#record-form").addEventListener("change", (event) => {
    if (event.target.matches("select[name=proposalId], select[name=projectId], select[name=clientId]")) syncRelatedFields(event.target.name);
  });
  document.querySelector("#close-dialog").addEventListener("click", () => dialog.close());
  document.querySelector("#cancel-dialog").addEventListener("click", () => dialog.close());
  document.querySelector("#export-backup").addEventListener("click", exportBackup);
  document.querySelector("#help-export").addEventListener("click", exportBackup);
  document.querySelector("#import-backup").addEventListener("change", (event) => {
    importBackup(event.currentTarget.files[0]);
    event.currentTarget.value = "";
  });

  if (storageReady && migrateLegacyCodes()) saveState();
  render();
})();
