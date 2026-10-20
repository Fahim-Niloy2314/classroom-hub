FROM python:3.12-slim
WORKDIR /app
COPY server.py hub_services.py index.html styles.css app.js hub-core.js hub-fixes.js hub-features.js data.js classroom_index.json portal_sync.json backend-config.json manifest.json sw.js jszip.min.js icon.svg icon-192.png icon-512.png cuet_routine_template_blank.docx cuet_routine_template_sample.docx ./
RUN mkdir -p /var/lib/classroom-hub && chown -R 10001:10001 /app /var/lib/classroom-hub
USER 10001
ENV CLASSROOM_BIND=0.0.0.0 CLASSROOM_PRIVATE_DIR=/var/lib/classroom-hub PORT=8080
EXPOSE 8080
CMD ["python", "server.py"]
