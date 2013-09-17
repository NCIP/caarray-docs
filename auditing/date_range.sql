SELECT r.id, r.created_date, r.username, r.type, r.entity_name, r.entity_id, d.attribute, d.old_value, d.new_value, d.message
FROM audit_log_detail d, audit_log_record r
WHERE d.record = r.id
AND r.created_date BETWEEN "2013-08-01" AND "2013-09-01"
ORDER BY r.created_date;