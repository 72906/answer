import { FC, useState } from 'react';
import { Container, Row, Col, Form, Table } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { loggedUserInfoStore } from '@/stores';
import { useTimelineData } from '@/services';
import { PageTitle, Empty } from '@/components';

import HistoryItem from './components/Item';

const Index: FC = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'timeline' });
  const { qid = '', aid = '', tid = '' } = useParams();
  const { is_admin } = loggedUserInfoStore((state) => state.user);
  const [showVotes, setShowVotes] = useState(false);

  const { data: timelineData, isLoading } = useTimelineData({
    object_id: tid || aid || qid,
    show_vote: showVotes,
  });

  const handleSwitch = (bol: boolean) => {
    setShowVotes(bol);
  };

  let linkUrl = '';
  if (timelineData?.object_info.object_type === 'question') {
    linkUrl = `/questions/${timelineData?.object_info.question_id}`;
  }

  if (timelineData?.object_info.object_type === 'answer') {
    linkUrl = `/questions/${timelineData?.object_info.question_id}/${timelineData?.object_info.answer_id}`;
  }

  if (timelineData?.object_info.object_type === 'tag') {
    linkUrl = `/tags/${
      timelineData?.object_info.main_tag_slug_name ||
      timelineData?.object_info.title
    }`;
  }

  const revisionList =
    timelineData?.timeline?.filter((item) => item.revision_id > 0) || [];

  return (
    <Container className="py-3">
      <PageTitle
        title={
          timelineData?.object_info.object_type === 'tag'
            ? `${t('title_for_tag')} ${timelineData?.object_info.title}`
            : `${t('title_for')} ${timelineData?.object_info.title}`
        }
      />
      <Row className="py-3 justify-content-center">
        <Col xxl={10}>
          <h5 className="mb-4">
            {t('title')}{' '}
            <Link to={linkUrl}>{timelineData?.object_info?.title}</Link>
          </h5>
          {timelineData?.object_info.object_type !== 'tag' && (
            <Form.Check
              className="mb-4"
              type="switch"
              id="custom-switch"
              label={t('show_votes')}
              checked={showVotes}
              onChange={(e) => handleSwitch(e.target.checked)}
            />
          )}
          <Table hover>
            <thead>
              <tr>
                <th style={{ width: '20%' }}>{t('datetime')}</th>
                <th style={{ width: '15%' }}>{t('type')}</th>
                <th style={{ width: '19%' }}>{t('by')}</th>
                <th>{t('comment')}</th>
              </tr>
            </thead>
            <tbody>
              {timelineData?.timeline?.map((item) => {
                return (
                  <HistoryItem
                    data={item}
                    objectInfo={timelineData?.object_info}
                    key={item.activity_id}
                    isAdmin={is_admin}
                    revisionList={revisionList}
                  />
                );
              })}
            </tbody>
          </Table>
          {!isLoading && Number(timelineData?.timeline?.length) <= 0 && (
            <Empty>{t('no_data')}</Empty>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Index;
